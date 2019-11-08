const nodemailer = require('nodemailer');
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const crypto = require('crypto');
const db = require('../db/tables/users');

// This file was written by Deanne Alabastro

/**
 * OAuth2 client for gmail
 */
const oauth2Client = new OAuth2(
    process.env.GMAILID,
    process.env.GMAILSECRET,
    "https://developers.google.com/oauthplayground" // Redirect URL
);

/**
 * Get access token 
 * @param {*} email 
 * @param {*} token 
 */
oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
});

const accessToken = oauth2Client.getAccessToken().catch(error => {console.error("ERROR WITH ACCESS TOKEN: ", error);});

/**
 * mail transporter object for testing (emails get redirected to the same inbox)
 */
// const transporter = nodemailer.createTransport({
//     host: 'smtp.mailtrap.io',
//     port: 2525,
//     auth: {
//         user: process.env.MAILTRAP_USER,
//         pass: process.env.MAILTRAP_PASSWORD
//     },
// });

/**
 * mail transporter object that uses google
 */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
         type: "OAuth2",
         user: "nwenstore@gmail.com", 
         clientId: process.env.GMAILID,
         clientSecret: process.env.GMAILSECRET,
         refreshToken: process.env.GMAIL_REFRESH_TOKEN,
         accessToken: accessToken
    }
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
async function sendEmailWithToken(email, token) {
    const link = "https://nwen304finalproject.herokuapp.com/auth/resetpassword/"+ token;

    const message = {
        from: "e-commerce@nwen.com",
        to: email,
        subject: "Password Reset",
        generateTextFromHTML: true,
        html:
            `<h1>Password Reset Request</h1><hr><br><p>You are receiving this because you (or someone else) have requested the reset of the password for your account.<br><br>
            Please click on the following link, or paste it into your browser to complete the process:<br><br>
            https://nwen304finalproject.herokuapp.com/auth/resetpassword/${token}<br><br>
            If you did not request this, please ignore this email and your password will remain unchanged.</p>`

    }

    return transporter.sendMail(message)
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
async function sendEmailWithoutToken(email) {
    const message = {
        from: "e-commerce@nwen.com",
        to: email,
        subject: "Password Reset",
        generateTextFromHTML: true,
        html:
            `<h1>Password Reset Request</h1><hr><br><p>You are receiving this because you (or someone else) have requested the reset of the password for your account.<br><br>
            Unfortunately, an account using this email address does not exist in our database.<br><br>
            If you wish to request another reset password link for a different account, please follow this link: https://nwen304finalproject.herokuapp.com/forgotpassword or 
            If you wish to create an account, please follow this link: https://nwen304finalproject.herokuapp.com/register<br><br>
            If you did not request this, please ignore this email.</p>`
    };

    return transporter.sendMail(message)
        .then(response => {
            return response;
        })
        .catch(err => {
            throw err;
        });
}

/**
 * Decides whether to send an email to the given address containing the token or
 * without depending on if email address is found in the database
 * @param {*} email 
 */
async function sendPasswordResetEmail(email) {
    return db.getUser(email)
        .then(userInformation => {
            // user does not exist in database, send them an email anyway but without reset token
            if (userInformation.rowCount == 0) {
                console.log("sending email for when email address does not exist in the database");
                return sendEmailWithoutToken(email);
            } else {
                console.log("sending email with reset token to email: ", email);
                // verified email exists, proceed with generating reset password token
                const token = crypto.randomBytes(20).toString('hex');
                console.log("token", token);

                // add token and token expiry time to user row in db
                return db.setResetToken(email, token)
                    .then(() => {
                        return sendEmailWithToken(email, token);
                    })
                    .catch(err => {
                        throw err;
                    });
            }
        })
        .catch(err => {
            throw err;
        })
}

module.exports = {
    sendPasswordResetEmail: sendPasswordResetEmail
};
