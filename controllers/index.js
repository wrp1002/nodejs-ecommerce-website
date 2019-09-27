const passwordHash = require('../passwordHash');

module.exports = function(app) {  
    app.get('/', async (req, res) => {
        //nav bar
        //recommended stuff
		// test

        res.render('pages/index');
    });

    app.get('/login', async (req, res) => {
        
        res.render('pages/login');
    });

    app.get('/register', async (req, res) => {
        
        res.render('pages/register');
    });

    app.get('/register/submit', async (req, res) => {
        console.log("Register attempt by " + req.params.email + ", " + req.params.password);
        return "Login " + passwordHash.storePassword(req.params.email, req.params.password) ? "Successful" : "Failed"
    });

    app.get('/resetpassword', async (req, res) => {
        

        //res.render('pages/index');
    });

    app.get('/forgotpassword', async (req, res) => {
        

        //res.render('pages/index');
    });

    app.get('/search', async (req, res) => {
        
        //res.render('pages/index');
    });

    app.get('/account', async (req, res) => {
        // purchase history and other info
        
        //res.render('pages/index');
    });

    app.get('/cart', async (req, res) => {
        
        //res.render('pages/index');
    });

}

