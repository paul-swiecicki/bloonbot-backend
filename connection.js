// const mongoose = require('mongoose')

// // user heroku_h4f3xwnf
// // pass 1p3tq6gev7p4bgpfvqtacasgav
// // host ds139167.mlab.com:39167
// // db heroku_h4f3xwnf
// //? heroku config:get MONGODB_URI
const dburl = 'mongodb://heroku_h4f3xwnf:1p3tq6gev7p4bgpfvqtacasgav@ds139167.mlab.com:39167/heroku_h4f3xwnf';
mongoose.connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})