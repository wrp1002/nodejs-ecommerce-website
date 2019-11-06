const db = require('./index');

// This file was written by Wesley Paglia

module.exports = {
    deleteOrderItems: (orderId, callback = null) => {
        return db.query("DELETE FROM order_items WHERE order_id = $1;", [orderId], callback ? callback : null);
    },
    addOrderItem: (orderId, productId, quantity, callback = null) => {
        return db.query("INSERT INTO order_items (order_id, product_id, quantity) VALUES($1, $2, $3);", [orderId, productId, quantity], callback ? callback : null);
    }
}