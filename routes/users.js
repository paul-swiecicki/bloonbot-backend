const bcrypt = require('bcryptjs')
const passport = require('passport')
const moment = require('moment')

const { sendServerError, incorrectLogin } = require('../functions/errors')
const initPassport = require('../passport-config')

const models = require('../models/models')

initPassport(passport,
    (login) => {
        return new Promise((resolve, reject) => {
            models.Users.findOne({login}, (err, data) => {
                if(err) reject(err);
                // console.log(data);
                resolve(data)
            })
        })
    },
    (id) => {
        return new Promise((resolve, reject) => {
            models.Users.findById(id, (err, data) => {
                if(err) reject(err);
                
                resolve(data)
            })
        })
    }
)

const sendAuthData = (req, res) => {
    if(req.isAuthenticated()){
        const user = req.user;
        const { login, permissions, autoSave } = user;
        let updatingTemplate = null;

        if(updatingTemplate = req.user.updatingTemplate){
            models.Templates.findById(updatingTemplate, (err, data) => {
                if(err) return sendServerError(res, err);
                res.status(200).json({ login, permissions, updatingTemplate: data })
            })
            //todo send autosave 
        } else {
            models.Templates.findById(autoSave)
                .lean()
                .exec((err, data) => {
                    if(err) return sendServerError(res, err);
    
                    if(data){
                        const createdAt = moment(data.timestamp, 'YYYYMMDD').fromNow();
                        data.timestamp = createdAt;
                    }
                    // console.log(data);
                    
                    res.status(200).json({ login, permissions, updatingTemplate, autoSave: data })
                })
        }
    } else {
        res.status(401).json({ msg: 'Not authorized' })
    }
}

module.exports = app => {
    app.get('/users', (req, res) => {
        models.Users.find((err, data) => {
            if(err) return sendServerError(res, err);

            res.json(data)
        })
    })

    app.get('/users/:login', (req, res) => {
        models.Users.find({login: req.params.login}, (err, data) => {
            if(err) return sendServerError(res, err);

            res.json(data)
        })
    })
    
    app.post('/users/register', (req, res) => {
        const login = req.body.login;
        const password = req.body.password;

        models.Users.findOne({login}, async (err, data) => {
            if(err) return sendServerError(res, err);
            
            if(data){
                return res.status(401).json({
                    msg: 'Login already in use.'
                })
            } else {
                const hashedPassword = await bcrypt.hash(password, 10)
                
                models.Users.create({
                    login,
                    password: hashedPassword,
                    permissions: 'standard'
                }, (err, data) => {
                    if(err) return sendServerError(res, err);

                    res.status(201).json({
                        msg: 'Account created. You can sign in now.'
                    })
                })
            }
        })
    })

    app.post('/users/signin', 
        (req, res, next) => {
            passport.authenticate('local', function(err, user, info) {
                if (err) { return res.sendStatus(500); }
                if (!user) { return res.status(401).json(info); }

                req.logIn(user, (err) => {
                    if(err) return res.sendServerError(res, err)

                    sendAuthData(req, res)
                    // let updatingTemplate = null;
                    // const { login, permissions } = user;

                    // if(updatingTemplate = user.updatingTemplate){
                    //     models.Templates.findById(updatingTemplate, (err, data) => {
                    //         if(err) return sendServerError(res, err);
                    //         res.status(200).json({ login, permissions, updatingTemplate: data})
                    //     })
                    // } else {
                    //     res.status(200).json({ login, permissions, updatingTemplate })
                    // }
                }); 
            })(req, res, next);
        }
    )

    app.post('/users/authorize', sendAuthData)

    app.post('/users/logout', (req, res) => {
        if(req.isAuthenticated()){
            req.logout();
            res.status(200).json({msg: 'Logged out'})
        } else {
            res.status(401).json({msg: 'No one is logged in'})
        }
    })

    // app.get('/users/:login/templates', (req, res) => {
    //     models.Users.find()
    // })
}