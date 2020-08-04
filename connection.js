const mongoose = require('mongoose')

//? heroku config:get MONGODB_URI
// const dburl = 'mongodb://heroku_h4f3xwnf:1p3tq6gev7p4bgpfvqtacasgav@ds139167.mlab.com:39167/heroku_h4f3xwnf';
const dburl = 'mongodb+srv://chawke:ZpQnKPinsBJoLZ1J@dallow-wish.vrddv.mongodb.net/bloonbot?retryWrites=true&w=majority';
mongoose.connect(dburl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})