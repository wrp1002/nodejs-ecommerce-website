const passwordHash = require('../passwordHash');
const bodyParser = require('body-parser')

module.exports = function(app) {  

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

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

    app.post('/register/submit', async (req, res) => {        
        
        if(!req.body.email) {
            return res.status(400).send({
                success: 'false',
                message: 'Email is required'
            });
        }
    
        if(!req.body.password) {
            return res.status(400).send({
                success: 'false',
                message: 'Password is required'
            });
        }
        
        passwordHash.storePassword(req.body.email, req.body.password).then(
            
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

