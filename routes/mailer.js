const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
// const { json } = require('body-parser')
dotenv.config()

function sendMail(mail, subject, msg){
    return new Promise((resolve, reject) => {


        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        })
    
        const updatedSubject = `${mail} - BloonBot mailer - ${subject || 'none'}`
        
        const mailOptions = {
            from: 'dallowwishstudios@gmail.com',
            to: 'dallowwishstudios@gmail.com',
            subject: updatedSubject,
            text: msg || 'none'
        }
        
        transporter.sendMail(mailOptions, (err, data) => {
            if(err){
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

module.exports = app => {
    app.post('/mail', async (req, res) => {
        const mail = req.body.mail;
        const subject = req.body.subject;
        const msg = req.body.msg;
        // body()

        try {
            const mRes = await sendMail(mail, subject, msg)
            return res.sendStatus(204)
        } catch (err) {
            return res.status(err.responseCode).json({errorCode: err.code, response: err.response})
        }
    })
}
