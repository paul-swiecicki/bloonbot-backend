const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const passport = require('passport')

const { sendServerError, incorrectLogin } = require('../functions/errors')
const initPassport = require('../passport-config')

initPassport(passport,
    (login) => {
        return new Promise((resolve, reject) => {
            Users.findOne({login}, (err, data) => {
                if(err) reject(err);
                // console.log(data);
                resolve(data)
            })
        })
    },
    (id) => {
        return new Promise((resolve, reject) => {
            Users.findById(id, (err, data) => {
                if(err) reject(err);
                
                resolve(data)
            })
        })
    }
)

const Schema = new mongoose.Schema({
    login: String,
    password: String,
    permissions: String // all or standard
})

const Users = mongoose.model('Users', Schema, 'users')

module.exports = app => {
    app.get('/users', (req, res) => {
        Users.find((err, data) => {
            if(err) return sendServerError(res, err);

            res.json(data)
        })
    })

    app.post('/users/register', (req, res) => {
        const login = req.body.login;
        const password = req.body.password;

        Users.findOne({login}, async (err, data) => {
            if(err) return sendServerError(res, err);
            
            if(data){
                return res.status(401).json({
                    msg: 'Login already in use.'
                })
            } else {
                const hashedPassword = await bcrypt.hash(password, 10)
                
                Users.create({
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
                    if(err) { return res.sendStatus(500); }
                    return res.status(200).json({ msg: 'Logged in', login: user.login });
                });

            })(req, res, next);
        }
    )

    app.post('/users/authorize', 
        (req, res) => {
            if(req.isAuthenticated()){
                res.status(200).json({ login: req.user.login })
            } else {
                res.status(401).json({ msg: 'Not authorized' })
            }
        }
    )

    app.post('/users/logout', (req, res) => {
        if(req.isAuthenticated()){
            req.logout();
            res.status(200).json({msg: 'Logged out'})
        } else {
            res.status(401).json({msg: 'No one is logged in'})
        }
    })
}