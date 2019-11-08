const router = require('express').Router()
const { forwardAuthenticated, ensureAuthenticated } = require('../config/auth.js')
const User = require('../services/shoppingService')
const { products, cart} = require('../db/all_tables');
const {placeOrder} = require('../db/transactions/placeorder');
const fs = require('fs');
var path = require("path");

/*
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});
*/

// This file was a group effort but the vast majority was written by Wesley Paglia

router.get('/', async (req, res) => {
    let count = await User.GetCartCount(req.user);
    res.render('pages/index', { loggedIn: req.isAuthenticated(), cartCount: count, flashMessages: res.locals });
});

router.get('/register', forwardAuthenticated, async (req, res) => {
    let count = await User.GetCartCount(req.user);
    res.render('pages/register', { loggedIn: req.isAuthenticated(), cartCount: count, flashMessages: res.locals })
})

router.get('/login', forwardAuthenticated, async (req, res) => {
    let count = await User.GetCartCount(req.user);
    res.render('pages/login', { loggedIn: req.isAuthenticated(), cartCount: count, flashMessages: res.locals })
})

router.get('/forgotpassword', async (req, res) => {
    let count = await User.GetCartCount(req.user);
    res.render('pages/forgotpassword', { loggedIn: req.isAuthenticated(), cartCount: count, flashMessages: res.locals });
});

router.get('/search', async (req, res) => {
    let count = await User.GetCartCount(req.user);
    let search = req.query.search;

    products.searchProducts(search, (error, results) => {
        if (error) {
            console.log(error);
            res.render('pages/search', { loggedIn: req.isAuthenticated(), products: [] });
        }
        else {
            res.render('pages/search', { loggedIn: req.isAuthenticated(), cartCount: count, products: results.rows });
        }
    });
});

router.get('/addproduct', ensureAuthenticated, async (req, res) => {
    let count = await User.GetCartCount(req.user);
    let accountType = await User.GetAccountType(req.user);

    if (accountType != 'admin')
        res.render('pages/error', { loggedIn: req.isAuthenticated(), cartCount: count });
    else
        res.render('pages/add', { loggedIn: req.isAuthenticated(), cartCount: count });
});

router.post('/addproduct', ensureAuthenticated, async (req, res) => {
    let accountType = await User.GetAccountType(req.user);

    if (accountType != 'admin')
        res.render('pages/error', { loggedIn: req.isAuthenticated(), cartCount: count });
    else {
        try {
            if (req.body.name == "" || req.body.description == "" || req.body.price == "" || req.body.image_path == "" || req.body.category == "") {
                res.send("Error: not all fields were filled");
            }
            else {
                products.addProduct(req.body.name, req.body.description, req.body.price, req.body.image_path, req.body.category, (error, results) => {
                    if (error) throw error;
                });

                res.send('<html><head><script>window.close();</script></head></html>');
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

    cart.getAllItemDetails(req.user, (error, results) => {
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
});

router.delete('/cart', ensureAuthenticated, async (req, res) => {
    if (req.body.id == "")
        res.sendStatus(500);
    else {
        cart.deleteItem(req.body.id, req.user, (error, results) => {
            if (error) {
                console.log(error);
                res.sendStatus(500);
            }
            else
                res.sendStatus(200);
        });
    }
});

router.patch('/cart', ensureAuthenticated, async (req, res) => {
    if (req.body.id == "" || req.body.quantity == "")
        res.sendStatus(500);
    else {
        cart.updateItemQuantity(req.body.quantity, req.body.id, req.user, (error, results) => {
            if (error) {
                console.log(error);
                res.sendStatus(500);
            }
            else
                res.sendStatus(200);
        });
    }
});

router.get('/cartCount', ensureAuthenticated, async (req, res) => {
    let count = await User.GetCartCount(req.user);
    res.json({ cartCount: count });
});

router.post('/cart', ensureAuthenticated, async (req, res) => {
    let count = await User.GetCartCount(req.user);

    try {
        if (req.user == "" || req.body.id == "" || req.body.quantity == "")
            res.sendStatus(400);
        else {
            let item_id = req.body.id;
            let quantity = req.body.quantity;
            cart.getItemQuantity(item_id, req.user, (error, results) => {
                if (error) {
                    console.error(error);
                    res.sendStatus(500);
                }
                else {
                    let currentQuantity = 0;
                    if (results.rows.length == 1)
                        currentQuantity = results.rows[0].quantity;

                    if (currentQuantity > 0) {
                        cart.increaseItemQuantity(quantity, item_id, req.user, (error, results) => {
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
                        cart.addItemToCart(req.user, item_id, quantity, (error, results) => {
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
            })

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

function expand(rowCount, columnCount, startAt = 1) {
    let index = startAt;
    return Array(rowCount).fill(0).map(v =>
        `(${Array(columnCount).fill(0).map(v => `$${index++}`).join(", ")})`
    ).join(", ");
}

router.get('/placeorder', ensureAuthenticated, async (req, res) => {
    let user = req.user;
    let count = await User.GetCartCount(user);
    let checkoutInfo = await User.GetTotalPrice(user);

    placeOrder(user, checkoutInfo.total)
    .then(() => {
        res.render('pages/placeorder', { loggedIn: req.isAuthenticated(), cartCount: 0 });
    })
    .catch(err => {
        console.error("Error: ", err);
        res.render('pages/error', { loggedIn: req.isAuthenticated(), cartCount: count });
    }); 
});

router.get('/account', ensureAuthenticated, async (req, res) => {
    // Purchase history and other info

    let count = await User.GetCartCount(req.user);
    let accountType = await User.GetAccountType(req.user);
    let purchaseHistory = await User.GetPurchaseHistory(req.user);


    if (purchaseHistory != null)
        res.render('pages/account', { loggedIn: req.isAuthenticated(), cartCount: count, currentUser: req.user, orders: purchaseHistory, accountType: accountType });
    else
        res.render('pages/error', { loggedIn: req.isAuthenticated(), cartCount: count });
});

router.get('/purchaseHistory', ensureAuthenticated, async (req, res) => {
    let accountType = await User.GetAccountType(req.user);

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

            fs.writeFile(fileName, purchaseHistory, function (err) {
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


    if (accountType != 'admin')
        res.render('pages/error', { loggedIn: req.isAuthenticated(), cartCount: count });
    else {
        let tmpPath = path.join(process.cwd(), "archive");
        console.log(tmpPath);
        fs.readdir(tmpPath, function (err, items) {
            if (err)
                res.render('pages/archive', { loggedIn: req.isAuthenticated(), cartCount: count, items: [] });
            else {
                res.render('pages/archive', { loggedIn: req.isAuthenticated(), cartCount: count, items: items });
            }
        });
    }
});

router.get('/archiveDownload', ensureAuthenticated, async (req, res) => {
    let accountType = await User.GetAccountType(req.user);

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


    if (req.query.weatherTemp != "")
        weatherTemp = parseFloat(req.query.weatherTemp);
    let search = '';

    if (weatherDescription.includes('rain') || weatherDescription.includes('shower'))
        search = 'rain';
    else if (weatherDescription.includes('snow') || weatherTemp <= 0)
        search = 'winter';

    products.getProductRecommendation(search, (error, results) => {
        if (error) {
            console.log(error);
            res.send("Error getting recommendation");
        }
        else {
            recommend = [results.rows[Math.floor(Math.random() * results.rows.length)]];
            res.render('partials/searchResults', { loggedIn: req.isAuthenticated(), products: recommend, small: true });
        }
    });
});


module.exports = router;