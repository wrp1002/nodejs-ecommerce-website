module.exports = function(app) {  
    app.get('/', async (req, res) => {
        //nav bar
        //

        res.render('pages/index');
    });

    app.get('/login', async (req, res) => {
        
        res.render('pages/login');
    });

    app.get('/register', async (req, res) => {
        
        res.render('pages/register');
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

