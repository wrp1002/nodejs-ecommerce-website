const passwordHash = require('../passwordHash');
const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser')
const jwt = require('jsonwebtoken')
const sjcl = require('sjcl');

module.exports = function(app) {  

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use(cookieParser())

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
            
                    jwt.sign({email: req.body.email}, process.env.JWT_KEY, { expiresIn: '1h' }, (errorMessage, token) => {

                        if(errorMessage){
                            return res.status(400).send({
                                success: 'false',
                                message: 'Signing the authorization token failed: ' + errorMessage
                            })
                        }

                        res.cookie('token', token, { maxAge: 900000, httpOnly: true, secure: true });
                        return res.status(201).send({
                            success: 'true',
                            message: 'User login successful',
                            token: sjcl.hash.sha256.hash(token)
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
                    message: "Password validation failed with error " + errorMessage
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

    app.get('/account', verifyToken, async (req, res) => {

        // Purchase history and other info
        res.render('pages/account');
    });

    app.get('/cart', async (req, res) => {
        
        //res.render('pages/index');
    });
}

function verifyToken(req, res, next) {
    
    const cookieToken = req.cookies.token;

    console.log(cookieToken)

    if(!cookieToken){
        return res.status(400).send({
            success: 'false',
            message: 'No token found in cookie'
        }) 
    }
    
    const bearerHeader = req.headers['authorization'];

    if(typeof bearerHeader !== 'undefined'){
        
        const bearerArray = bearerHeader.split(' ');
        const accessToken = bearerArray[1];
        req.token = accessToken;

        jwt.verify(cookieToken, process.env.JWT_KEY, (errorMessage, authData) => {
            
            if(errorMessage){
                return res.status(403).send({
                    success: 'false',
                    message: 'Error verifying authorization token ' + errorMessage
                })
            }

            if(sjcl.hash.sha256.hash(cookieToken) != accessToken){
                return res.status(400).send({
                    success: 'false',
                    message: 'Error tokens did not match'
                })
            }

            req.authData = authData;

            next();
        })
    }
    else {
        return res.status(403).send({
            success: 'false',
            message: 'Authorization token not found'
        })
    }
}
