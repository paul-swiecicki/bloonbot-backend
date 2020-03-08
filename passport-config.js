const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcryptjs')
// const { incorrectLogin } = require('functions/errors')
const badAuthMsg = 'Incorrect login or password'

const initialize = (passport, getUserByLogin, getUserById) => {
    const authenticateUser = async (login, password, done) => {
        const user = await getUserByLogin(login)
        
        if(!user){
            return done(null, false, {msg: badAuthMsg})
        }

        try {
            if(await bcrypt.compare(password, user.password)){
                return done(null, user)
            } else {
                return done(null, false, {msg: badAuthMsg})            
            }
        } catch(e) {
            return done(e)
        }
    }

    passport.use(new LocalStrategy({
        usernameField: 'login'
    }, authenticateUser))

    passport.serializeUser((user, done) => {
        return done(null, user.id)
    })
    passport.deserializeUser(async (id, done) => {
        const user = await getUserById(id)
        return done(null, user)
    })
}

module.exports = initialize