const router = require('express').Router()
const { forwardAuthenticated, ensureAuthenticated } = require('../config/auth.js')
const User = require('../controllers/user.js')

const { Pool } = require('pg');
const fs = require('fs');

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

    //recommended stuff
    let count = await User.GetCartCount(req.user);
    res.render('pages/index', { loggedIn: req.isAuthenticated(), cartCount: count, flashMessages: res.locals });
});

router.get('/register', forwardAuthenticated, async(req, res) => {
    let count = await User.GetCartCount(req.user);
    res.render('pages/register', { loggedIn: req.isAuthenticated(), cartCount: count, flashMessages: res.locals })
})

router.get('/login', forwardAuthenticated, async(req, res) => {
    let count = await User.GetCartCount(req.user);
    res.render('pages/login', { loggedIn: req.isAuthenticated(), cartCount: count, flashMessages: res.locals })
})

router.get('/resetpassword/:token', async (req, res) => {
    // check that token is valid
    const client = await pool.connect();


    //res.render('pages/index');
});

router.get('/forgotpassword', async (req, res) => {
    let count = await User.GetCartCount(req.user);
    res.render('pages/forgotpassword', { loggedIn: req.isAuthenticated(), cartCount: count, flashMessages: res.locals});
});

router.get('/search', async (req, res) => {
    let count = await User.GetCartCount(req.user);
    let search = req.query.search;

    console.log("searching for " + search);

    const client = await pool.connect();
    client.query("select * from products where upper(name) LIKE upper('%' || $1 || '%') OR upper(description) LIKE upper('%' || $1 || '%') OR upper(category) LIKE upper('%' || $1 || '%')", [search], (error, results) => {
        if (error) {
            console.log(error);
            res.render('pages/search', { loggedIn: req.isAuthenticated(), products: [] });
        } 
        else {
            console.log(results.rows.length + " results");
            res.render('pages/search', { loggedIn: req.isAuthenticated(), cartCount: count, products: results.rows });
        }
    });

    client.release();
});

router.get('/add', ensureAuthenticated, async (req, res) => {
    let count = await User.GetCartCount(req.user);
    res.render('pages/add', { loggedIn: req.isAuthenticated(), cartCount: count });
});

router.post('/add', ensureAuthenticated, async (req, res) => {
    try {
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
    } 
    catch (err) {
        console.error(err);
        res.send("Error " + err);
    }
    
});

router.get('/cart', ensureAuthenticated, async (req, res) => {
    let user = req.user;
    let count = await User.GetCartCount(req.user);

    const client = await pool.connect();
    client.query("SELECT cart_items.id, name, quantity, price, image_path FROM cart_items INNER JOIN products ON cart_items.item_id=products.id WHERE cart_items.email = $1", [user], (error, results) => {
        if (error) {
            console.log(error);
            res.render('pages/index', { loggedIn: req.isAuthenticated(), cartCount: count });
        } 
        else {
            //console.log(results.rows.length + " items");
            let total = 0;
            for (let i = 0; i < results.rows.length; i++)
                total += results.rows[i].price * results.rows[i].quantity;

            total = Math.floor(total * 100 + .5) / 100;

            res.render('pages/cart', { loggedIn: req.isAuthenticated(), cartCount: count, cart: results.rows, totalPrice: total });
        }
    });

    client.release();
});

router.delete('/cart', ensureAuthenticated, async (req, res) => {
    if (req.body.id == "")
        res.sendStatus(500);
    else {
        const client = await pool.connect();
        client.query("DELETE FROM cart_items WHERE id = $1", [req.body.id], (error, results) => {
            if (error) {
                console.log(error);
                res.sendStatus(500);
            } 
            else
                res.sendStatus(200);
        });

        client.release();
    }
});

router.patch('/cart', ensureAuthenticated, async (req, res) => {
    if (req.body.id == "" || req.body.quantity == "")
        res.sendStatus(500);
    else {
        const client = await pool.connect();
        client.query("UPDATE cart_items SET quantity = $1 WHERE id = $2", [req.body.quantity, req.body.id], (error, results) => {
            if (error) {
                console.log(error);
                res.sendStatus(500);
            } 
            else
                res.sendStatus(200);
        });

        client.release();
    }
});

router.get('/cartCount', ensureAuthenticated, async (req, res) => {
    let count = await User.GetCartCount(req.user);
    res.json({cartCount: count});
});

router.post('/cartAdd', ensureAuthenticated, async (req, res) => {
    let count = await User.GetCartCount(req.user);

    try {
        if (req.user == "" || req.body.id == "" || req.body.quantity == "")
            res.render('pages/error', { loggedIn: req.isAuthenticated(), cartCount: count });
        else {
            const client = await pool.connect();
            client.query('INSERT INTO cart_items (email, item_id, quantity) values ($1, $2, $3)', [req.user, req.body.id, req.body.quantity], (error, results) => {
                if (error) throw error;
                res.sendStatus(200); 
            });

            client.release();
        }
    } 
    catch (err) {
        console.error(err);
        res.render('pages/error', { loggedIn: req.isAuthenticated(), cartCount: count });
    }
});

router.get('/checkout', ensureAuthenticated, async (req, res) => {
    let user = req.user;
    let count = await User.GetCartCount(user);
    let checkoutInfo = await User.GetTotalPrice(user);

    res.render('pages/checkout', { loggedIn: req.isAuthenticated(), cartCount: count, subtotal: checkoutInfo.subtotal, tax: checkoutInfo.tax, shipping: checkoutInfo.shipping, total: checkoutInfo.total });
});

router.get('/placeorder', ensureAuthenticated, async (req, res) => {
    let user = req.user;
    let count = await User.GetCartCount(user);
    let checkoutInfo = await User.GetTotalPrice(user);
    let errors = false;

    try {
        const client = await pool.connect();
        client.query('INSERT INTO orders (email, total_price) values ($1, $2) RETURNING *;', [req.user, checkoutInfo.total], (error, results) => {
            if (error) {
                console.error(error);
                errors = true;
            } 
            else {
                let orderID = results.rows[0].id;

                client.query("SELECT products.id, cart_items.quantity FROM cart_items INNER JOIN products ON cart_items.item_id=products.id WHERE cart_items.email = $1", [user], (error, results) => {
                    if (error) {
                        console.error(error);
                        errors = true;
                    } 
                    else {
                        for (let i = 0; i < results.rows.length; i++)  {
                            client.query("INSERT INTO order_items (order_id, product_id, quantity) VALUES($1, $2, $3);", [orderID, results.rows[i].id, results.rows[i].quantity], (error, results) => {
                                if (error) {
                                    console.error(error);
                                    errors = true;
                                } 
                            });
                        }
                        client.query("DELETE FROM cart_items where email= $1", [req.user], (error, results) => {
                            if (error) {
                                console.error(error);
                                errors = true;
                            } 
                        });
                    }
                });
            }
        });

        client.release();
    } 
    catch (err) {
        console.error(err);
        errors = true;
    }

    if (errors)
        res.render('pages/error', { loggedIn: req.isAuthenticated(), cartCount: count });
    else
        res.render('pages/placeorder', { loggedIn: req.isAuthenticated(), cartCount: 0 });
});

router.get('/account', ensureAuthenticated, async (req, res) => {
    // Purchase history and other info

    let count = await User.GetCartCount(req.user);
    let accountType = await User.GetAccountType(req.user);
    let purchaseHistory = await User.GetPurchaseHistory(req.user);

    if (purchaseHistory != null)
        res.render('pages/account', { loggedIn: req.isAuthenticated(), cartCount: count, currentUser: req.user, orders: purchaseHistory, accountType: accountType });
    else
        res.render('pages/error', { loggedIn: req.isAuthenticated(), cartCount: count});
});

router.get('/purchaseHistory', ensureAuthenticated, async (req, res) => {
    if (req.query.email == "")
        res.send("");
    else {
        let purchaseHistory = await User.GetPurchaseHistory(req.query.email);
        if (purchaseHistory.length == 0)
            res.send("No results");
        else
            res.render("partials/purchaseHistory", { orders: purchaseHistory });
    }
});

router.delete('/purchaseHistory', ensureAuthenticated, async (req, res) => {
    console.log("Archiving...");
    if (req.body.email == "")
        res.sendStatus(500);
    else {
        let purchaseHistory = await User.GetPurchaseHistory(req.body.email);
        purchaseHistory = JSON.stringify(purchaseHistory);

        let date = new Date();
        let fileName = process.cwd() + "/output.txt";
        console.log("Saving as", fileName);

        fs.writeFile(fileName, purchaseHistory, function(err) {
            if (err) {
                console.log("fail");
                res.sendStatus(500);
            }
            else {
                console.log("Did it");
                res.sendStatus(200);
            }
        });
    }
});


module.exports = router;