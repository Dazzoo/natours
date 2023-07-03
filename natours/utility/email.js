const formData = require('form-data')
const Mailgun = require('mailgun.js')
const mailgun = new Mailgun(formData)

const sendEmail = function (props) {
    const mg = mailgun.client({
        username: 'api',
        key: process.env.MAILGUN_API_KEY,
    })

    mg.messages
        .create('sandbox-123.mailgun.org', {
            from: 'Yurii Shushanskyi from Natours',
            to: [props.email],
            subject: props.subject,
            text: props.message || null,
            html: props.html || null,
        })
        .then((msg) => console.log(msg)) // logs response data
        .catch((err) => console.log(err)) // logs any error
}

const emailResetMessageText = function (props) {
    return `
    Dear ${props.name},

    We have received a request to reset your account password. To ensure the security of your account, please follow the instructions below to reset your password.
    
    Click on the following link to access the password reset page:
    ${props.link}
    
    You will be directed to a secure webpage where you can set a new password.
    
    Enter a new password of your choice. Please make sure to choose a strong and unique password that you haven't used before.
    
    Confirm your new password by entering it again in the designated field.
    
    Click on the "Reset Password" button to save your new password.
    
    If you did not request a password reset, please ignore this message and take appropriate measures to ensure the security of your account.
    
    Please note that this link will expire within ${process.env.RESET_PASSWORD_TOKEN_EXPIRES_IN} minutes, so make sure to reset your password promptly.
    
    If you experience any difficulties or require further assistance, please contact our support team at yuraks4646@gmail.com.
    
    Best regards,
    
    Natours Support Team
    
    `
}

module.exports = {
    sendEmail,
    emailResetMessageText,
}
