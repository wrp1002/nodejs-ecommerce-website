const nodemailer = require('nodemailer');

/**
 * mail transporter object
 */
const transporter = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASSWORD
    },
});

/**
 * This function is used when the forgot password email address
 * provided by the user exists in the database.
 * 
 * The email sent to the given email address contains a password reset link
 * which contains the token.
 *  
 * @param {*} email 
 * @param {*} token 
 */
async function sendResetTokenEmail(email, token) {
    const message = {
        from: `e-commerce@nwen.com`,
        to: `${email}`,
        subject: `Password Reset`,
        text:
            'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'https://nwen304finalproject.herokuapp.com/resetpassword/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'

    }

    transporter.sendMail(message)
        .then(response => {
            return response;
        })
        .catch(err => {
            throw err;
        });
}

/**
 * This function is used when the forgot password email address
 * provided by the user does not exist in the database.
 * 
 * It sends an email to the given email address informing the user
 * that they have requested a password reset token for an account that
 * does not exist. The mail also includes a link to the forget password
 * route and a link to create a new account.
 * 
 * @param {*} email 
 */
async function sendNoUserFoundEmail(email) {
    const message = {
        from: `e-commerce@nwen.com`,
        to: `${email}`,
        subject: `Password Reset`,
        text:
            `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
            `Unfortunately, an account using this email address does not exist in our database.\n\n` +
            `If you wish to request another reset password link for a different account, please follow this link: https://nwen304finalproject.herokuapp.com/forgotpassword \n\n` + `or\n\n` +
            `If you wish to create an account, please follow this link: https://nwen304finalproject.herokuapp.com/register\n\n` +
            'If you did not request this, please ignore this email.\n'
    };

    return transporter.sendMail(message)
        .then(response => {
            return response;
        })
        .catch(err => {
            throw err;
        });
}

module.exports = {
    sendNoUserFoundEmail: sendNoUserFoundEmail,
    sendResetTokenEmail: sendResetTokenEmail
};
