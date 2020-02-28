const mongoose = require('mongoose')

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
        try {
            Templates.find({}, (err, data) => {
                // if(err) throw err
                
                res.json(data)
            })
        } catch(err) {
            console.log(err);
        }
    })
    
    app.post('/templates', (req, res) => {
        try {
            const newTemplate = Templates.create(req.body, (err, data) => {
                // if(err) throw err
                
                res.json(data)
            })
        } catch(err) {
            console.log(err);
        }
    })

    app.delete('/templates/:id', (req, res) => {
        try {
            Templates.findByIdAndDelete(req.params.id, (err, data) => {
                // if(err) throw err

                res.json(data)
            })
        } catch(err) {
            console.log(err);
        }
    })

    // app.delete('/templates/:name', (req, res) => {
    //     Templates.findOneAndDelete({}, (err, data) => {
    //         if(err) throw err

    //         console.log(data);
    //         res.json(data)
    //     })
    // })
    
    app.get('/templates/:id', (req, res) => {
        try {
            Templates.findById(req.params.id, (err, data) => {
                // if(err) throw err;

                res.json(data)
            })
        } catch(err) {
            console.log(err);
        }
    })
}