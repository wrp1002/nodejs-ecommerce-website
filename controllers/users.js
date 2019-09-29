const bcrypt = require('bcryptjs')
const express = require('express')
const passport = require('passport')
const router = express.Router()
const pg = require('pg');

const { forwardAuthenticated} = require('../config/auth.js')

const databasePool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

router.get('/register', forwardAuthenticated, async(req, res) => {
    res.render('pages/register')
})

router.get('/login', forwardAuthenticated, async(req, res) => {
    res.render('pages/login')
})

router.post('/register', async(req, res) => {

    try {

        var errorList = [];
        const{ email, name, password, confirm } = req.body;
        
        if (!name || !email || !password || !confirm) errorList.push({ msg: 'Please enter all fields' });
        if (password != confirm) errorList.push({ msg: 'Passwords do not match' });
        if (password.length < 6) errorList.push({ msg: 'Password must be at least 6 characters' });
      
        if (errorList.length > 0) {

            return res.render('pages/register', {
                errorList,
                name,
                email,
                password,
                confirm
            });
        }
        
        const client = await databasePool.connect();
                
        await client.query("SELECT * FROM users WHERE email = $1", [email], function(errorMessage, userInformation) {
                
            if(errorMessage) throw errorMessage

            if(userInformation.rowCount != 0){

                errorList.push({ msg: 'Email already exists' });
                return res.render('pages/register', {
                    errorList,
                    name,
                    email,
                    password,
                    confirm
                });
            }

            bcrypt.genSalt(10, (saltError, generatedSalt) => {
                
                if(saltError) throw saltError

                bcrypt.hash(password, generatedSalt, async(hashError, passwordHash) => {
                    
                    if(hashError) throw hashError
                    
                    await client.query("INSERT INTO users (email, password_hash, salt) VALUES ($1, $2, $3)", [email, String(passwordHash), generatedSalt], function(errorMessage, results) {
            
                        if(errorMessage) throw errorMessage

                        req.flash(
                            'success_msg',
                            'You are now registered and can log in'
                        );
    
                    })

                })

            })
           
        })

    } catch(Error) { console.error(String(Error)) }

})

router.get('/google', passport.authenticate('google', {
    scope: 'email'
}))

router.get('/google/callback', async(req, res, next) => {

    passport.authenticate('google', {

        successRedirect: '/',
        failureRedirect: 'users/login',
        failureFlash: true

    })(req, res, next);

})

router.post('/login', async(req, res, next) => {
    
    passport.authenticate('local', {

        successRedirect: '/',
        failureRedirect: 'users/login',
        failureFlash: true

    })(req, res, next);

})
  
router.get('/logout', async(req, res) => {
    
    req.logout();+
    req.flash('success_msg', 'You are logged out');
    res.redirect('users/login');

})

//Resetting password
//await client.query("UPDATE users SET password_hash = $1, salt = $2 WHERE email = $3", [passwordHash, generatedSalt, receivedEmail], function(errorMessage, results) {

module.exports = router;