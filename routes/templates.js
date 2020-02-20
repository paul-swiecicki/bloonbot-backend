const mongoose = require('mongoose')

const dburl = 'mongodb://heroku_h4f3xwnf:1p3tq6gev7p4bgpfvqtacasgav@ds139167.mlab.com:39167/heroku_h4f3xwnf';
mongoose.connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const templatesSchema = new mongoose.Schema({
    name: String,
    author: {
        id: String,
        name: String
    },
    template: Object
})

const Templates = mongoose.model('Templates', templatesSchema)

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