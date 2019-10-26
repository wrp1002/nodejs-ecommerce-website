const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = require('express').Router();
const { Pool } = require('pg');
const { check, validationResult } = require('express-validator');
const mailer = require('../logic/mailer');

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
        // email not valid
        const emailError = errors.mapped().email.msg;
        req.flash("error", emailError);
        return res.status(400).redirect("/forgotpassword");
    }

    try {
        mailer.sendPasswordResetEmail(email)
            .then(response => {
                console.log("Email response ", response);
                req.flash('info', `An email has successfully been sent to ${email} with further instructions.\n If you did not receive an email, please check your spam.`);
                return res.status(200).redirect("/login");
            })
            .catch(err => {
                console.error("Error sending email " + err);
                req.flash('error', 'An error occurred trying to process your request. Please try again');
                return res.status(500).redirect("/forgotpassword");
            });
    } catch (Error) {
        console.error(String(Error));
        return res.status(500).send('An error occurred trying to process your request');
    }
})

module.exports = router;