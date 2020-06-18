// if(process.env.NODE_ENV !== 'production'){
//     require('dotenv').config()
// }

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const session = require('express-session')
// const MongoDBStore = require('connect-mongodb-session')(session);
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
// const flash = require('express-flash')
const passport = require('passport')
const app = express()

// const db = require('./connection.js')

const users = require('./routes/users')
const templates = require('./routes/templates')

const dburl = 'mongodb://heroku_h4f3xwnf:1p3tq6gev7p4bgpfvqtacasgav@ds139167.mlab.com:39167/heroku_h4f3xwnf';
mongoose.connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
// app.use(express.static('../public'))
app.use(bodyParser.json());
// app.use(bodyParser.text());
// app.use(cors());
// app.options('*', cors())

app.use(session({
    secret: 'waq89ufaiw3r09jarfipkfa0sa',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
    // store: new MongoDBStore({ mongooseConnection: mongoose.connection })
}))

app.use(cors({
    origin: true,
    credentials: true,
    // methods: true
}))
app.use(function (req, res, next) {
    // res.header("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization');
    if (req.method === "OPTIONS") {
        return res.status(200).end();
    } else {
        next();
    }
});
// app.use(flash());
app.use(passport.initialize())
app.use(passport.session())

users(app)
templates(app)

// const PORT = process.env.PORT || 3003
// app.listen(PORT, () => {
//     console.log('Server running on:', PORT);
// })

app.set( 'port', ( process.env.PORT || 3003 ));

// Start node server
app.listen( app.get( 'port' ), function() {
  console.log( 'Node server is running on port ' + app.get( 'port' ));
});