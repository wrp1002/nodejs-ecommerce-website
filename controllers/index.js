const passwordHash = require('../passwordHash');
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')

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

    app.post('/login', async (req, res) => {
        
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

        passwordHash.validatePassword(req.body.email, req.body.password).then(
            
            function(successMessage){   
                
                if(successMessage){
            
                    jwt.sign({email: req.body.email}, "secretkey", { expiresIn: '1h' }, (errorMessage, token) => {

                        if(errorMessage){
                            return res.status(400).send({
                                success: 'false',
                                message: 'Signing the authorization token failed: ' + errorMessage
                            })
                        }

                        return res.status(201).send({
                            success: 'true',
                            message: 'User login successful',
                            token: token
                        })
                    })
                }
                else {
                    return res.status(400).send({
                        success: 'false',
                        message: 'User login unsuccessful'
                    })
                }
            },

            function(errorMessage){
                return res.status(400).send({
                    success: 'false',
                    message: errorMessage
                })
            }
        )
        
    });

    app.get('/register', async (req, res) => {
        res.render('pages/register');
    });

    app.post('/register', async (req, res) => {        
        
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

    app.get('/account', processToken, async (req, res) => {

        jwt.verify(req.token, 'secretkey', (errorMessage, authData) => {
            
            if(errorMessage){
                //res.render('pages/login');
                return res.status(403).send({
                    success: 'false',
                    message: 'Error verifying authorization token'
                })
            }

            // Purchase history and other info
            res.render('pages/account');

        })        
    });

    app.get('/cart', async (req, res) => {
        
        //res.render('pages/index');
    });
}

function processToken(req, res, next) {
    
    const bearerHeader = req.headers['authorization'];

    if(typeof bearerHeader !== 'undefined'){
        const bearerArray = bearerHeader.split(' ');
        const accessToken = bearerArray[1];
        req.token = accessToken;
        next();
    }
    else {
        return res.status(403).send({
            success: 'false',
            message: 'Authorization token not found'
        })
    }
}
