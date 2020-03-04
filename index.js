// if(process.env.NODE_ENV !== 'production'){
//     require('dotenv').config()
// }

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const session = require('express-session')
// const MongoStore = require('connect-mongo')(session);
// const mongoose = require('mongoose');
const flash = require('express-flash')
const passport = require('passport')
const app = express()

const db = require('./connection.js')

const users = require('./routes/users')
const templates = require('./routes/templates')
// app.use(express.static('../public'))
app.use(bodyParser.json());
app.use(cors());
app.options('*', cors())

app.use(session({
    secret: 'secretie',
    // secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
    // store: new MongoStore({ mongooseConnection: mongoose.connection })
}))

app.use(flash());
app.use(passport.initialize())
app.use(passport.session())

users(app)
templates(app)

const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
    console.log('Server running on:', PORT);
})