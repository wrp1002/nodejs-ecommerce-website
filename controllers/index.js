const router = require('express').Router()
const { forwardAuthenticated, ensureAuthenticated } = require('../config/auth.js')
const User = require('../controllers/user.js')

const { Pool } = require('pg');
const fs = require('fs');
var path = require("path");

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
    let count = await User.GetCartCount(req.user);
    res.set('Cache-Control', 'private, max-age=3600');
    res.render('pages/index', { loggedIn: req.isAuthenticated(), cartCount: count, flashMessages: res.locals });
});

router.get('/register', forwardAuthenticated, async(req, res) => {
    let count = await User.GetCartCount(req.user);
    res.set('Cache-Control', 'private, max-age=3600');
    res.render('pages/register', { loggedIn: req.isAuthenticated(), cartCount: count, flashMessages: res.locals })
})

router.get('/login', forwardAuthenticated, async(req, res) => {
    let count = await User.GetCartCount(req.user);
    res.set('Cache-Control', 'private, max-age=3600');
    res.render('pages/login', { loggedIn: req.isAuthenticated(), cartCount: count, flashMessages: res.locals })
})

router.get('/forgotpassword', async (req, res) => {
    let count = await User.GetCartCount(req.user);
    res.set('Cache-Control', 'private, max-age=3600');
    res.render('pages/forgotpassword', { loggedIn: req.isAuthenticated(), cartCount: count, flashMessages: res.locals});
});

router.get('/search', async (req, res) => {
    let count = await User.GetCartCount(req.user);
    let search = req.query.search;
    res.set('Cache-Control', 'private, max-age=3600');

    if (!search) 
        search='';

    const client = await pool.connect();
    client.query("select * from products where upper(name) LIKE upper('%' || $1 || '%') OR upper(description) LIKE upper('%' || $1 || '%') OR upper(category) LIKE upper('%' || $1 || '%')", [search], (error, results) => {
        if (error) {
            console.log(error);
            res.render('pages/search', { loggedIn: req.isAuthenticated(), products: [] });
        } 
        else {
            res.render('pages/search', { loggedIn: req.isAuthenticated(), cartCount: count, products: results.rows });
        }
    });

    client.release();
});

router.get('/addproduct', ensureAuthenticated, async (req, res) => {
    let count = await User.GetCartCount(req.user);
    let accountType = await User.GetAccountType(req.user);
    res.set('Cache-Control', 'private, max-age=3600');

    if (accountType != 'admin')
        res.render('pages/error', { loggedIn: req.isAuthenticated(), cartCount: count});
    else
        res.render('pages/add', { loggedIn: req.isAuthenticated(), cartCount: count });
});

router.post('/addproduct', ensureAuthenticated, async (req, res) => {
    let accountType = await User.GetAccountType(req.user);

    if (accountType != 'admin')
        res.render('pages/error', { loggedIn: req.isAuthenticated(), cartCount: count});
    else {
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

router.post('/cart', ensureAuthenticated, async (req, res) => {
    let count = await User.GetCartCount(req.user);

    try {
        if (req.user == "" || req.body.id == "" || req.body.quantity == "")
            res.sendStatus(400);
        else {
            let item_id = req.body.id;
            let quantity = req.body.quantity;
            const client = await pool.connect();
            client.query('SELECT quantity FROM cart_items WHERE item_id = $1 AND email = $2', [item_id, req.user], (error, results) => {
                if (error) {
                    console.error(error);
                    res.sendStatus(500);
                }
                else {
                    let currentQuantity = 0;
                    if (results.rows.length == 1)
                        currentQuantity = results.rows[0].quantity;

                    if (currentQuantity > 0) {
                        client.query('UPDATE cart_items SET quantity = quantity + $1 WHERE item_id = $2 AND email = $3', [quantity, item_id, req.user], (error, results) => {
                            if (error) {
                                console.error(error);
                                res.sendStatus(500);
                            }
                            else {
                                res.sendStatus(200);
                            }
                        });
                    }
                    else {
                        client.query('INSERT INTO cart_items (email, item_id, quantity) VALUES($1, $2, $3)', [req.user, item_id, quantity], (error, results) => {
                            if (error) {
                                console.error(error);
                                res.sendStatus(500);
                            }
                            else {
                                res.sendStatus(200);
                            }
                        });
                    }
                }
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
    res.set('Cache-Control', 'private, max-age=3600');

    res.render('pages/checkout', { loggedIn: req.isAuthenticated(), cartCount: count, subtotal: checkoutInfo.subtotal, tax: checkoutInfo.tax, shipping: checkoutInfo.shipping, total: checkoutInfo.total });
});

router.get('/placeorder', ensureAuthenticated, async (req, res) => {
    let user = req.user;
    let count = await User.GetCartCount(user);
    let checkoutInfo = await User.GetTotalPrice(user);
    let errors = false;
    res.set('Cache-Control', 'private, max-age=3600');

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
    res.set('Cache-Control', 'private, max-age=3600');

    if (purchaseHistory != null)
        res.render('pages/account', { loggedIn: req.isAuthenticated(), cartCount: count, currentUser: req.user, orders: purchaseHistory, accountType: accountType });
    else
        res.render('pages/error', { loggedIn: req.isAuthenticated(), cartCount: count});
});

router.get('/purchaseHistory', ensureAuthenticated, async (req, res) => {
    let accountType = await User.GetAccountType(req.user);
    res.set('Cache-Control', 'private, max-age=3600');

    if (accountType != 'admin')
        res.send("No results");
    else if (req.query.email == "")
        res.send("No results");
    else {
        let purchaseHistory = await User.GetPurchaseHistory(req.query.email);
        if (purchaseHistory.length == 0)
            res.send("No results");
        else
            res.render("partials/purchaseHistory", { orders: purchaseHistory });
    }
});

router.delete('/purchaseHistory', ensureAuthenticated, async (req, res) => {
    let accountType = await User.GetAccountType(req.user);

    if (accountType != 'admin')
        res.sendStatus(401);
    else {
        console.log("Archiving...");
        if (req.body.email == "")
            res.sendStatus(500);
        else {
            let purchaseHistory = await User.GetPurchaseHistory(req.body.email);
            purchaseHistory = JSON.stringify(purchaseHistory);

            let date = new Date();
            let name = req.body.email + " " + date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear() + " " + date.getHours() + ";" + date.getMinutes() + ".txt";

            var archive_dir = path.join(process.cwd(), 'archive/');

            if (!fs.existsSync(archive_dir))
                fs.mkdirSync(archive_dir);

            let fileName = archive_dir + name;

            fs.writeFile(fileName, purchaseHistory, function(err) {
                if (err) {
                    res.sendStatus(500);
                }
                else {
                    if (User.DeletePurchaseHistory(req.body.email))
                        res.sendStatus(200);
                    else
                        res.sendStatus(500);
                }
            });
        }
    }
});

router.get('/archive', ensureAuthenticated, async (req, res) => {
    let count = await User.GetCartCount(req.user);
    let accountType = await User.GetAccountType(req.user);
    res.set('Cache-Control', 'private, max-age=3600');

    if (accountType != 'admin')
        res.render('pages/error', { loggedIn: req.isAuthenticated(), cartCount: count});
    else {
        let tmpPath = path.join(process.cwd(), "archive");
        console.log(tmpPath);
        fs.readdir(tmpPath, function(err, items) {
            if (err)
                res.render('pages/archive', { loggedIn: req.isAuthenticated(), cartCount: count, items: []});
            else {
                res.render('pages/archive', { loggedIn: req.isAuthenticated(), cartCount: count, items: items});
            }
        });
    }
});

router.get('/archiveDownload', ensureAuthenticated, async (req, res) => {
    let accountType = await User.GetAccountType(req.user);
    res.set('Cache-Control', 'private, max-age=3600');

    if (accountType != 'admin')
        res.sendStatus(401);
    else {
        file = path.join(process.cwd(), "archive");
        file = path.join(file, req.query.file);
        if (fs.existsSync(file))
            res.download(file);
        else
            res.sendStatus(404);
    }
});

router.get('/recommendation', async (req, res) => {
    let weatherTemp = 20;
    let weatherDescription = req.query.weatherDescription;
    res.set('Cache-Control', 'private, max-age=3600');

    if (req.query.weatherTemp != "")
        weatherTemp = parseFloat(req.query.weatherTemp);
    let search = '';

    if (weatherDescription.includes('rain') || weatherDescription.includes('shower'))
        search = 'rain';
    else if (weatherDescription.includes('snow') || weatherTemp <= 0)
        search = 'winter';

    const client = await pool.connect();
    client.query("select * from products where upper(category) LIKE upper('%' || $1 || '%')", [search], (error, results) => {
        if (error) {
            console.log(error);
            res.send("Error getting recommendation");
        } 
        else {
            recommend = [results.rows[Math.floor(Math.random() * results.rows.length)]];
            res.render('partials/searchResults', { loggedIn: req.isAuthenticated(), products: recommend, small: true });
        }
    });

    client.release();
});


module.exports = router;