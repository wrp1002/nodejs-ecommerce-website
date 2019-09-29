const router = require('express').Router()
const { forwardAuthenticated, ensureAuthenticated } = require('../config/auth.js')

router.get('/', async (req, res) => {
    
    //nav bar
    //recommended stuff
    // test

    res.render('pages/index', { loggedIn: req.isAuthenticated });
});

router.get('/register', forwardAuthenticated, async(req, res) => {
    res.render('pages/register', { loggedIn: req.isAuthenticated })
})

router.get('/login', forwardAuthenticated, async(req, res) => {
    res.render('pages/login', { loggedIn: req.isAuthenticated })
})

router.get('/resetpassword', async (req, res) => {
    

    //res.render('pages/index');
});

router.get('/forgotpassword', async (req, res) => {
    

    //res.render('pages/index');
});

router.get('/search', async (req, res) => {
    
    //res.render('pages/index');
});

router.get('/account', ensureAuthenticated, async (req, res) => {

    // Purchase history and other info
    res.render('pages/account');
});

router.get('/cart', async (req, res) => {
    
    //res.render('pages/index');
});

module.exports = router;