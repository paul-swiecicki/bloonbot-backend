const mongoose = require('mongoose')

const dburl = 'mongodb://localhost:27017/bloonbot';
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
        res.send('bot backend')
    })
    
    app.get('/templates', (req, res) => {
        Templates.find({}, (err, data) => {
            // if(err) throw err

            res.json(data)
        })
    })

    app.post('/templates', (req, res) => {
        const newTemplate = Templates.create(req.body, (err, data) => {
            // if(err) throw err
            
            res.json(data)
        })
    })

    app.delete('/templates/:id', (req, res) => {
        Templates.findByIdAndDelete(req.params.id, (err, data) => {
            // if(err) throw err

            res.json(data)
        })
    })

    // app.delete('/templates/:name', (req, res) => {
    //     Templates.findOneAndDelete({}, (err, data) => {
    //         if(err) throw err

    //         console.log(data);
    //         res.json(data)
    //     })
    // })
    
    app.get('/templates/:id', (req, res) => {
        Templates.findById(req.params.id, (err, data) => {
            // if(err) throw err;

            res.json(data)
        })
    })
}