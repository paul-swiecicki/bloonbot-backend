const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
// const { incorrectLogin } = require('functions/errors')

const initialize = (passport, getUserByLogin, getUserById) => {
    // console.log(done);
    
    const authenticateUser = (login, password, done) => {
        getUserByLogin(login, async (user) => {
            if(!user){
                return done(null, false, {message: 'No user with that login'})
            }
    
            try {
                // console.log(user.login);
                if(await bcrypt.compare(password, user.password)){
                    return done(null, user)
                } else {
                    return done(null, false, {message: 'Password incorrect'})            
                }
            } catch(e) {
                return done(e)
            }
        })
    }

    passport.use(new LocalStrategy({
        usernameField: 'login'
    }, authenticateUser))

    passport.serializeUser((user, done) => {
        return done(null, user.id)
    })
    passport.deserializeUser((id, done) => {
        getUserById(id, (user) => {
            return done(null, user)
        })
    })
}

module.exports = initialize