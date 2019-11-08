const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = require('express').Router();
const { Pool } = require('pg');
const { check, validationResult } = require('express-validator');
const mailer = require('../services/mailer');
const hashGenerator = require('../services/hashGenerator');
const usersDB = require('../db/users');
const User = require('../controllers/user.js');

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

// Registration, OAuth and Login routes on this page were made by Dylan Hoefsloot

// Reset and forgot password routes were made by Deanna Alabastro

router.post('/register', [

    check('email', 'The email entered is not valid. Please enter a valid email address').not().isEmpty().isEmail().normalizeEmail(),
    check('name', 'Name Required. Please enter your name').not().isEmpty().trim().escape(),
    check('password', 'Your password must be at least six characters').not().isEmpty().isLength({ min: 6 }),
    check('confirm', 'Passwords do not match').custom((value, { req }) => (value === req.body.password))
], 

async (req, res) => {

    // Input validation
    const errors = validationResult(req);
    const { email, name, password, confirm } = req.body;
    let count = await User.GetCartCount(req.user);

    if (!errors.isEmpty()) {

        const errorMessages = errors.array().map(error => { return error.msg });
        return res.render('pages/register', {
            loggedIn: req.isAuthenticated(),
            flashMessages: { error: errorMessages, success: [], info: [] },
            cartCount: count,
            name,
            email,
            password,
            confirm
        });
    }

    usersDB.getUser(email)
        .then(userInformation => {
            if (userInformation.rowCount != 0) {
                // all fields valid but email exists => return to register page
                return res.render('pages/register', {
                    loggedIn: req.isAuthenticated(),
                    flashMessages: { error: ['Email already exists'], success: [], info: [] },
                    cartCount: count,
                    name,
                    email,
                    password,
                    confirm
                });
            }

            // email valid and does not exist in database. Proceed with creation
            return hashGenerator.generateSaltedHash(10, password)
                .then(hash => {
                    return usersDB.createNewUser(email, hash)
                        .then(() => {
                            req.flash(
                                'success',
                                'You are now registered and can log in'
                            );

                            res.redirect('/login');
                        })
                        .catch(err => { throw err });
                })
                .catch(err => {
                    throw err;
                })
        })
        .catch(err => {
            console.error(err);
            return res.status(500).send('An error occurred trying to process your request');
        })

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

    passport.authenticate('local', function (err, user, info) {
        
        if (err) {
            console.error(err);
            req.flash('error', 'An error occurred processing your request. Please try again later');
            return res.redirect('/login');
        }
        
        if (!user) {
            req.flash('error', 'Invalid email or password.');
            return res.redirect('/login');
        }
        
        req.logIn(user, function (err) {
            
            if (err) {
                console.error(err);
                req.flash('error', 'An error occurred processing your request. Please try again later');
                return res.redirect('/login');
            }
            
            usersDB.removeResetToken(user)
                .then(() => { console.log("Removed any saved reset tokens under the email ", user) })
                .catch(err => { console.error(err) });
            
            return res.redirect('/');
        });

    })(req, res, next);
})

router.get('/logout', async (req, res) => {

    req.logout();
    req.flash('success', 'You are logged out');

    res.redirect('/login');
})

router.get('/resetpassword/:token', async (req, res) => {

    console.log("Checking validity of reset token");
    const token = req.params.token;
    let count = await User.GetCartCount(req.user);
    // check if token is valid
    usersDB.checkResetTokenValidity(token)
        .then(results => {
            // if not valid render invalid resetpassword page
            if (results.rowCount == 0) {
                console.log("reset token is not valid: ", token);
                res.status(403).render('pages/resetpassword', { loggedIn: req.isAuthenticated(), cartCount: count, isValid: false });
            } else {
                // valid - render resetpassword page
                console.log("reset token valid. Rendering page");
                res.status(200).render('pages/resetpassword', { loggedIn: req.isAuthenticated(), cartCount: count, flashMessages: res.locals, isValid: true, token: token });
            }
        }).catch(err => {
            console.error(err);
            return res.status(500).send('An error occurred trying to process your request');
        });
})

router.post('/resetpassword/', [
    check('password', 'Your password must be at least six characters').not().isEmpty().isLength({ min: 6 }),
    check('confirm', 'Passwords do not match').custom((value, { req }) => (value === req.body.password))
], async (req, res) => {
    // check validity of token 
    const token = req.body.token;
    let count = await User.GetCartCount(req.user);

    usersDB.checkResetTokenValidity(token)
        .then(results => {
            // if not valid render invalid resetpassword page
            if (results.rowCount == 0) {
                console.log("reset token is not valid: ", token);
                res.status(403).render('pages/resetpassword', { loggedIn: req.isAuthenticated(), cartCount: count, isValid: false, token: token });
            } else {
                // valid - continue with input validation
                console.log("reset token valid. Checking input validity");
                const errors = validationResult(req);
                const { password, confirm } = req.body;

                if (!errors.isEmpty()) {
                    // error, so re-render register page
                    const errorMessages = errors.array().map(error => { return error.msg });
                    return res.render('pages/resetpassword', {
                        loggedIn: req.isAuthenticated(),
                        flashMessages: { error: errorMessages, success: [], info: [] },
                        cartCount: count,
                        isValid: true,
                        token: token
                    });
                } else {
                    // update account and redirect to home
                    return hashGenerator.generateSaltedHash(10, password)
                        .then(hash => {
                            return usersDB.updateUserHash(token, hash)
                                .then(() => {
                                    req.flash(
                                        'success',
                                        'Your password has been updated.'
                                    );

                                    res.redirect('/login');
                                }).catch(err => { throw err; });
                        }).catch(err => {
                            throw err;
                        });

                }
            }
        }).catch(err => {
            console.error(err);
            return res.status(500).send('An error occurred trying to process your request');
        });
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