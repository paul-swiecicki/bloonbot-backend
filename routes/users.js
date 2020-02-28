const mongoose = require('mongoose')

const Schema = new mongoose.Schema({
    login: String,
    password: String
})

const Users = mongoose.model('Users', Schema, 'users')

module.exports = app => {
    app.get('/users', (req, res) => {
        try {
            Users.find((err, data) => {
                if(err) console.log(err);

                res.json(data)
            })
        } catch (err) {
            console.log(err);
        }
    })

    app.post('/users', (req, res) => {
        try {
            Users.create(req.body, (err, data) => {
                if(err) console.log(err);
                
                res.json(data)
            })
        } catch(err) {
            console.log(err);
        }
    })
}