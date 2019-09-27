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
        
        passwordHash.storePassword(req.params.email, req.params.password).then(
            
            function(successMessage){
                return res.status(201).send({
                    success: 'true',
                    message: 'User created successfully'
                })
            },

            function(errorMessage){
                return res.status(400).send({
                    success: 'false',
                    message: errorMessage
                })
            }
        )

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

