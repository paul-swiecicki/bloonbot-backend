const sendServerError = (res, err) => {
    return res.status(500).json({msg: err})
}

const incorrectLogin = (res) => {
    return res.status(401).json({
        msg: 'Incorrect login or password.'
    })
}

const authError = (res) => {
    return res.status(401).json({
        msg: 'Unauthorized - log in or register first.'
    })
}

module.exports = {
    sendServerError,
    incorrectLogin,
    authError
}