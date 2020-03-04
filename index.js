const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session);
// const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const app = express()

const db = require('./connection.js')

const users = require('./routes/users')
const templates = require('./routes/templates')
// app.use(express.static('../public'))
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors())

const store = new MongoDBStore({
    uri: 'mongodb://heroku_h4f3xwnf:1p3tq6gev7p4bgpfvqtacasgav@ds139167.mlab.com:39167/heroku_h4f3xwnf',
    collection: 'sessions',
  })
app.use(session({
    secret: 'secret-key',
    resave: true,
    saveUninitialized: false,
    store: store,
    // store: new MongoStore({ mongooseConnection: mongoose.connection }),
    cookie: {
        secure: false,
        rolling: true
    }
}))

users(app)
templates(app)

const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
    console.log('Server running on:', PORT);
})