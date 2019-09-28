const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
    
    //nav bar
    //recommended stuff
    // test

    res.render('pages/index');
});

router.get('/resetpassword', async (req, res) => {
    

    //res.render('pages/index');
});

router.get('/forgotpassword', async (req, res) => {
    

    //res.render('pages/index');
});

router.get('/search', async (req, res) => {
    
    //res.render('pages/index');
});

router.get('/account', async (req, res) => {

    // Purchase history and other info
    res.render('pages/account');
});

router.get('/cart', async (req, res) => {
    
    //res.render('pages/index');
});

module.exports = router;