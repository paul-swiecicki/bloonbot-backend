const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()

const templates = require('./routes/templates')
// app.use(express.static('../public'))
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors())

templates(app)

const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
    console.log('Server running on:', PORT);
})