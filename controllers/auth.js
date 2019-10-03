const bcrypt = require('bcryptjs')
const passport = require('passport')
const router = require('express').Router()
const { Pool } = require('pg');
const { check, validationResult } = require('express-validator/check');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

/*
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});
*/

// Used to local testing

const databasePool = new Pool({
    user: 'eqoaufryrlziba',
    host: 'ec2-54-235-104-136.compute-1.amazonaws.com',
    database: 'debldnvrsqnjov',
    password: 'ca96d213b57dca84daf23d6c6e76840266b0aa26f73bbf30bff67f81d84002ff',
    port: 5432,
    ssl: true
});


router.post('/register', async (req, res) => {

    try {

        var errorList = [];
        const { email, name, password, confirm } = req.body;

        if (!name || !email || !password || !confirm) errorList.push({ msg: 'Please enter all fields' });
        if (password != confirm) errorList.push({ msg: 'Passwords do not match' });
        if (password.length < 6) errorList.push({ msg: 'Password must be at least 6 characters' });

        if (errorList.length > 0) {

            return res.render('pages/register', {
                loggedIn: req.isAuthenticated(),
                errorList,
                name,
                email,
                password,
                confirm
            });
        }

        const client = await databasePool.connect();

        await client.query("SELECT * FROM users WHERE email = $1", [email], function (errorMessage, userInformation) {

            if (errorMessage) throw errorMessage

            if (userInformation.rowCount != 0) {

                errorList.push({ msg: 'Email already exists' });
                return res.render('pages/register', {
                    loggedIn: req.isAuthenticated(),
                    errorList,
                    name,
                    email,
                    password,
                    confirm
                });
            }

            bcrypt.genSalt(10, (saltError, generatedSalt) => {

                if (saltError) throw saltError

                bcrypt.hash(password, generatedSalt, async (hashError, passwordHash) => {

                    if (hashError) throw hashError

                    await client.query("INSERT INTO users (email, password_hash, salt) VALUES ($1, $2, $3)", [email, String(passwordHash), generatedSalt], function (errorMessage, results) {

                        if (errorMessage) throw errorMessage

                        req.flash(
                            'success_msg',
                            'You are now registered and can log in'
                        );

                        res.redirect('/login');

                    })

                })

            })

        })

    } catch (Error) { console.error(String(Error)) }

})

router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}))

router.get('/google/callback', async (req, res, next) => {

    passport.authenticate('google', {

        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true

    })(req, res, next);

})

router.post('/login', async (req, res, next) => {

    passport.authenticate('local', {

        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true

    })(req, res, next);

})

router.get('/logout', async (req, res) => {

    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');

})

router.post('/forgotpassword', [
    check('email', `The email entered is not valid. Please enter a valid email address`).not().isEmpty().isEmail().normalizeEmail()
], async (req, res) => {

    // input validation
    const errors = validationResult(req);
    const { email } = req.body;
    if (!errors.isEmpty()) {
        const emailError = errors.mapped().email.msg;
        req.flash("error", emailError);
        return res.redirect("/forgotpassword");
    }

    try {
        const client = await databasePool.connect();

        // check if inputted email address exists
        await client.query("SELECT * FROM users WHERE email = $1", [email], async (errorMessage, userInformation) => {

            if (errorMessage) throw errorMessage;

            // create mail transporter
            const transporter = nodemailer.createTransport({
                host: 'smtp.mailtrap.io',
                port: 2525,
                auth: {
                    user: process.env.MAILTRAP_USER,
                    pass: process.env.MAILTRAP_PASSWORD
                },
            });

            // user does not exist in database, send them an email anyway but without reset token
            if (userInformation.rowCount == 0) {
                const message = {
                    from: `e-commerce@nwen.com`,
                    to: `${email}`,
                    subject: `Password Reset`,
                    text:
                        `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
                        `Unfortunately, an account using this email address does not exist in our database.\n\n` +
                        `If you wish to request another reset password link for a different account, please follow this link: https://nwen304finalproject.herokuapp.com/forgotpassword \n` + `or\n` +
                        `If you wish to create an account, please follow this link: https://nwen304finalproject.herokuapp.com/register\n\n` +
                        'If you did not request this, please ignore this email.\n'
                };

                console.log("Sending reset mail");

                transporter.sendMail(message, function (err, response) {
                    if (err) {
                        console.error("Error sending email " + err);
                        req.flash('error', 'An error occurred trying to process your request. Please try again');
                        return res.redirect(500, "/forgotpassword");
                    } else {
                        console.log("Email response ", response);
                        req.flash('info', `An email has successfully been sent to ${email} with further instructions.`);
                        return res.status(200).redirect("/login");
                    }
                });


            }

            // verified email exists, proceed with generating reset password token
            const token = crypto.randomBytes(20).toString('hex');
            console.log("token", token);

            // add token and token expiry time to user row in db
            await client
                .query(`UPDATE users SET reset_token = $1, token_expiry = to_timestamp($2 / 1000.0) WHERE email = $3`, [token, Date.now() + 900000, email])
                .then(() => {
                    // send email to user with reset token link

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

                    console.log("Sending reset mail");

                    transporter.sendMail(message, function (err, response) {
                        if (err) {
                            console.error("Error sending email " + err);
                            req.flash('error', 'An error occurred trying to process your request. Please try again');
                            return res.redirect(500, "/forgotpassword");
                        } else {
                            console.log("Email response ", response);
                            req.flash('info', `An email has successfully been sent to ${email} with further instructions.`);
                            return res.status(200).redirect("/login");
                        }
                    });
                })
                .catch(error => {
                    console.error(error);
                    return res.status(500).send('An error occurred trying to process your request');
                });


        });

    } catch (Error) {
        console.error(String(Error));
        return res.status(500).send('An error occurred trying to process your request');
    }

})

module.exports = router;