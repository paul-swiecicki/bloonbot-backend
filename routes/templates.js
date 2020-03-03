const mongoose = require('mongoose')

const { sendServerError, authError } = require('../functions/errors')

const templatesSchema = new mongoose.Schema({
    name: String,
    author: Object,
    template: Object
})

const Templates = mongoose.model('Templates', templatesSchema, 'templates')

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
        const user = req.session.user;
        if(user){
            Templates.create({
                ...req.body,
                author: {
                    id: user.id,
                    login: user.login
                }
            }, (err, data) => {
                if(err) return sendServerError(res, err);

                res.json(data)
            })
        } else {
            return authError(res)
        }
    })

    app.delete('/templates/:id', (req, res) => {
        if(req.session.user){
            Templates.findById(req.params.id, (err, data) => {
                if(err) return sendServerError(res, err);
                
                if(data.author && req.session.user.id === data.author.id || req.session.user.permissions === 'all'){
                    data.remove((err, data) => {
                        if(err) return sendServerError(res, err);
                        
                        res.json(data)
                    })
                } else return authError(res)

                res.json(data)
            })
        } else {
            return authError(res)
        }
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