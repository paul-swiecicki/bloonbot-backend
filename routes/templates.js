const mongoose = require('mongoose')

const { sendServerError, authError } = require('../functions/errors')

const templatesSchema = new mongoose.Schema({
    name: String,
    author: Object,
    template: Object
})

const Templates = mongoose.model('Templates', templatesSchema, 'templates')

const checkAuth = (req, res, next) => {
    if(req.isAuthenticated()){
        next()
    } else {
        return authError(res)
    }
}

module.exports = app => {
    app.get('/', (req, res) => {
        try {
            res.send('bot backend')
        } catch(err) {
            console.log(err);
        }
    })
    
    app.get('/templates', (req, res) => {
        Templates.find({}, (err, data) => {
            if(err) return sendServerError(res, err);
            
            res.json(data)
        })
    })
    
    app.post('/templates', (req, res) => {
        const user = req.user;
        if(req.isAuthenticated()){
            Templates.create({
                ...req.body,
                author: {
                    id: user.id,
                    name: user.login
                }
            }, (err, data) => {
                if(err) return sendServerError(res, err);
                // console.log(data);
                res.json(data)
            })
        } else {
            return res.status(401).json({
                msg: 'Not allowed - log in or register first.'
            })
        }
    })

    app.delete('/templates/:id', checkAuth, (req, res) => {
        Templates.findById(req.params.id, (err, data) => {
            if(err) return sendServerError(res, err);
            
            if(data && data.author && req.user.id === data.author.id || req.user.permissions === 'all'){
                data.remove((err, data) => {
                    if(err) return sendServerError(res, err);
                    
                    res.status(200).json(data)
                })
            } else {
                return res.status(401).json({
                    msg: 'Not allowed.'
                })
            }
        })
    })

    // app.delete('/templates/:name', (req, res) => {
    //     Templates.findOneAndDelete({}, (err, data) => {
    //         if(err) return sendServerError(res, err);

    //         console.log(data);
    //         res.json(data)
    //     })
    // })
    
    app.get('/templates/:id', (req, res) => {
        Templates.findById(req.params.id, (err, data) => {
            if(err) return sendServerError(res, err);

            res.json(data)
        })
    })
}