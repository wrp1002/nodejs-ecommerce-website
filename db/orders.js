const db = require('./index');

// This file was written by Wesley Paglia

module.exports = {
    getAllOrders: (email, callback = null) => {
        return db.query("select * from orders where email = $1;", [email], callback ? callback : null);
    },
    deleteUserOrders: (email, callback = null) => {
        return db.query("DELETE FROM orders WHERE email = $1;", [email], callback ? callback : null);
    },
    checkout: (email, total_price, callback = null) => {
        return db.query("INSERT INTO orders (email, total_price) values ($1, $2) RETURNING *;", [email, total_price], callback ? callback : null);
    }
}