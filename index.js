const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()

const db = require('./connection.js')

const users = require('./routes/users')
const templates = require('./routes/templates')
// app.use(express.static('../public'))
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors())

users(app)
templates(app)

const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
    console.log('Server running on:', PORT);
})