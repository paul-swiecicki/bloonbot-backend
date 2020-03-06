const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
// const { incorrectLogin } = require('functions/errors')

const initialize = (passport, getUserByLogin, getUserById) => {
    const authenticateUser = async (login, password, done) => {
        const user = await getUserByLogin(login)
        console.log(user);
        
        if(!user){
            return done(null, false, {msg: 'No user with that login'})
        }

        try {
            // console.log(user.login);
            if(await bcrypt.compare(password, user.password)){
                return done(null, user)
            } else {
                return done(null, false, {msg: 'Password incorrect'})            
            }
        } catch(e) {
            return done(e)
        }
    }

    passport.use(new LocalStrategy({
        usernameField: 'login'
    }, authenticateUser))

    passport.serializeUser((user, done) => {
        console.log('serialized:', user);
        
        return done(null, user.id)
    })
    passport.deserializeUser(async (id, done) => {
        const user = await getUserById(id)
        console.log('deserialized: ', user);
        return done(null, user)
    })
}

module.exports = initialize