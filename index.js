const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const templates = require('./routes/templates')
// app.use(express.static('../public'))
app.use(bodyParser.json());
templates(app)

const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
    console.log('Server running on:', PORT);
})