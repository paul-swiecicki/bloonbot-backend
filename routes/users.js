const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const Schema = new mongoose.Schema({
    login: String,
    password: String,
    permissions: String // all or standard
})

const Users = mongoose.model('Users', Schema, 'users')

module.exports = app => {
    app.get('/users', (req, res) => {
        Users.find((err, data) => {
            if(err) console.log(err);

            res.json(data)
        })
    })

    app.post('/users/register', (req, res) => {
        const login = req.body.login;
        const password = req.body.password;

        Users.findOne({login}, async (err, data) => {
            if(err) console.log(err);
            
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
                    if(err) console.log(err);
                    res.sendStatus(201)
                })
            }
        })
    })

    app.post('/users/signin', (req, res) => {

        const incorrectLogin = (res) => {
            return res.status(401).json({
                msg: 'Incorrect login or password.'
            })
        }

        Users.findOne({login: req.body.login}, async (err, data) => {
            if(data){
                if(err) console.log(err);
                
                if(await bcrypt.compare(req.body.password, data.password)){
                    return res.sendStatus(200)
                } else {
                    return incorrectLogin(res)
                }
            } else {
                return incorrectLogin(res)
            }
        })
    })
}