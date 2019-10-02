const router = require('express').Router()
const { forwardAuthenticated, ensureAuthenticated } = require('../config/auth.js')

const { Pool } = require('pg');

/*
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});
*/

// Used to local testing

const pool = new Pool({
    user: 'eqoaufryrlziba',
    host: 'ec2-54-235-104-136.compute-1.amazonaws.com',
    database: 'debldnvrsqnjov',
    password: 'ca96d213b57dca84daf23d6c6e76840266b0aa26f73bbf30bff67f81d84002ff',
    port: 5432,
    ssl: true
});

router.get('/', async (req, res) => {
    
    //nav bar
    //recommended stuff
    // test

    res.render('pages/index', { loggedIn: req.isAuthenticated() });
});

router.get('/register', forwardAuthenticated, async(req, res) => {
    res.render('pages/register', { loggedIn: req.isAuthenticated() })
})

router.get('/login', forwardAuthenticated, async(req, res) => {
    res.render('pages/login', { loggedIn: req.isAuthenticated(), errorFlash: req.flash('error'), successFlash: req.flash('success') })
})

router.get('/resetpassword', async (req, res) => {
    

    //res.render('pages/index');
});

router.get('/forgotpassword', async (req, res) => {

    console.log("routing for fp ", res.locals);
    console.log("rew au", req.isAuthenticated());
    res.render('pages/forgotpassword', { loggedIn: req.isAuthenticated(), flashMessages: res.locals});
});

router.get('/search', async (req, res) => {
    res.render('pages/search', { loggedIn: req.isAuthenticated() });
});

router.post('/search', async (req, res) => {
    try {
        const client = await pool.connect();
        client.query("select * from products where upper(name) LIKE upper('%' || $1 || '%') OR upper(description) LIKE upper('%' || $1 || '%') OR upper(category) LIKE upper('%' || $1 || '%')", [req.body.search], (error, results) => {
            if (error) {
                console.log(error);
                res.send("No results found");
            } 
            else {
                if (results.rows.length > 0) {
                    res.render('partials/searchResults', { loggedIn: req.isAuthenticated(), products: results.rows });
                }
                else
                    res.send("No results found");
            }
        });

        client.release();

    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
});

router.get('/add', async (req, res) => {
    res.render('pages/add', { loggedIn: req.isAuthenticated() });
});

router.post('/add', async (req, res) => {
    console.log('SEARCH');
    try {
        console.log(req.body.name)
        if (req.body.name == "" || req.body.description == "" || req.body.price == "" || req.body.image_path == "" || req.body.category == "") {
            res.send("Error: not all fields were filled");
        }
        else {
            const client = await pool.connect();
            client.query('INSERT INTO products (name, description, price, image_path, category) values ($1, $2, $3, $4, $5)', [req.body.name, req.body.description, req.body.price, req.body.image_path, req.body.category], (error, results) => {
                if (error) throw error;    
            });
            res.send('<html><head><script>window.close();</script></head></html>');

            client.release();
    }

    } catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
    
});

router.get('/cart', async (req, res) => {
    
    //res.render('pages/index');
});

router.get('/search', async (req, res) => {
    
    //res.render('pages/index');
});

router.get('/account', ensureAuthenticated, async (req, res) => {

    // Purchase history and other info
    res.render('pages/account', { loggedIn: req.isAuthenticated(), currentUser: req.user });
});

router.get('/cart', async (req, res) => {
    
    //res.render('pages/index');
});

module.exports = router;