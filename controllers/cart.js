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

module.exports = {
    GetCartCount: function(user) {
        return new Promise(async (resolve, reject) => {
            const client = await pool.connect();

            client.query("SELECT * FROM cart_items WHERE email = $1", [user], (error, results) => {
                if (error) {
                    if (error) throw error;
                } 
                else {
                    client.release();
                    total = 0;
                    for (let i = 0; i < results.rows.length; i++)
                        total += results.rows[i].quantity;
                    resolve(total);
                }
            });
        });
    },

    GetTotalPrice: function(user) {
        return new Promise(async (resolve, reject) => {
            const client = await pool.connect();

            client.query("SELECT quantity, price FROM cart_items INNER JOIN products ON cart_items.item_id=products.id WHERE cart_items.email = $1", [user], (error, results) => {
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
                    resolve({subtotal: subtotal, tax: tax, shipping: shipping, total: total});
                }
            });
        });
    }
}