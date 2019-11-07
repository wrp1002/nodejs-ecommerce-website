const { Pool } = require('pg');
const { orders, cart, users, orderItems } = require('../db/all_tables');

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

// This file was written by Wesley Paglia

module.exports = {
    GetCartCount: function (user) {
        return new Promise(async (resolve, reject) => {
            cart.getCartItems(user, (error, results) => {
                if (error) {
                    if (error) throw error;
                }
                else {
                    total = 0;
                    for (let i = 0; i < results.rows.length; i++)
                        total += results.rows[i].quantity;
                    resolve(total);
                }
            });
        });
    },

    GetTotalPrice: function (user) {
        return new Promise(async (resolve, reject) => {
            cart.getTotalPrice(user, (error, results) => {
                if (error) {
                    throw error;
                }
                else {
                    //console.log(results.rows.length + " items");
                    let subtotal = 0;
                    for (let i = 0; i < results.rows.length; i++)
                        subtotal += results.rows[i].price * results.rows[i].quantity;

                    subtotal = Math.floor(subtotal * 100 + .5) / 100;
                    let taxPercent = 0.15;          // This could be changed and improved if actual purchases were added
                    let tax = Math.floor(subtotal * taxPercent + .5) / 100;    // This could be changed and improved if actual purchases were added
                    let shipping = 9.99;            // This could be changed and improved if actual purchases were added

                    let total = Math.floor((subtotal + tax + shipping) * 100 + .5) / 100

                    resolve({ subtotal: subtotal, tax: tax, shipping: shipping, total: total });
                }
            });
        });
    },

    GetAccountType: function (user) {
        return new Promise(async (resolve, reject) => {
            users.getAccountType(user, (error, results) => {
                if (error) {
                    throw error;
                }
                else {
                    let type = results.rows[0].account_type;
                    resolve(type);
                }
            });
        });
    },

    GetPurchaseHistory(user) {
        return new Promise(async (resolve, reject) => {
            let userOrders = [];

            orders.getAllOrders(user, async (error, results) => {
                if (error) {
                    resolve(null);
                }
                else {
                    userOrders = results.rows;

                    for (let i = 0; i < userOrders.length; i++) {
                        userOrders[i].items = await new Promise(async (resolve, reject) => {
                            // get the names and quantity of products in the order
                            orderItems.getAllOrderProductDetails(userOrders[i].id, (error, results) => {
                                if (error) {
                                    resolve([]);
                                }
                                else {
                                    resolve(results.rows);
                                }
                            });
                        });
                    }

                    for (let i = 0; i < userOrders.length; i++) {
                        var monthNames = [
                            "January", "February", "March",
                            "April", "May", "June", "July",
                            "August", "September", "October",
                            "November", "December"
                        ];
                        let date = monthNames[userOrders[i].date.getMonth()] + " " + userOrders[i].date.getDate() + ", " + userOrders[i].date.getFullYear();
                        userOrders[i].date = date;
                    }
                    resolve(userOrders.reverse());
                }
            });
        });
    },

    DeletePurchaseHistory(user) {
        return new Promise(async (resolve, reject) => {
            orders.deleteUserOrders(user, async (error, results) => {
                if (error) {
                    resolve(false);
                }
                resolve(true);
            });
        });
    }

}