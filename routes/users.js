const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const { sendServerError, incorrectLogin } = require('../functions/errors')

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

    app.post('/users/signin', (req, res) => {
        // console.log(req.session);
        const login = req.body.login;
        const password = req.body.password;
        
        Users.findOne({login}, async (err, data) => {
            if(err) return sendServerError(res, err);
            const userId = data._id;

            if(data){
                if(await bcrypt.compare(password, data.password)){
                    req.session.user = {
                        id: userId,
                        login,
                        permissions: data.permissions
                    }

                    return res.status(200).json({
                        login,
                        msg: 'Logged in'
                    })
                } else {
                    return incorrectLogin(res)
                }
            } else {
                return incorrectLogin(res)
            }
        })
    })

    app.post('/users/logout', (req, res) => {
        if(req.session.user){
            req.session.destroy(err => {
                if(err) return sendServerError(res, err);

                else res.status(200).json({
                    msg: 'Logged out successfully'
                });
            })
        } else {
            res.status(401).json({
                msg: 'Cannot log out, nobody is logged in.'
            })
        }
    })
}