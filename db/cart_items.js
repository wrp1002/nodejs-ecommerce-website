const db = require('./index');

module.exports = {
    getCartItems: (user, callback = null) => {
        return db.query("SELECT * FROM cart_items WHERE email = $1", [user], callback ? callback : null);
    },
    getItemQuantity: (itemId, email, callback = null ) => {
        return db.query("SELECT quantity FROM cart_items WHERE item_id = $1 AND email = $2", [itemId, email], callback ? callback : null);
    },
    deleteItem: (itemId, email, callback = null ) => {
        return db.query("DELETE FROM cart_items WHERE id = $1 and email = $2", [itemId, email], callback ? callback : null);
    },
    updateItemQuantity: (quantity, itemId, email, callback = null ) => {
        return db.query("UPDATE cart_items SET quantity = $1 WHERE id = $2 and email = $3", [quantity, itemId, email], callback ? callback : null);
    },
    increaseItemQuantity: (quantity, itemId, email, callback = null ) => {
        return db.query("UPDATE cart_items SET quantity = quantity + $1 WHERE item_id = $2 AND email = $3", [quantity, itemId, email], callback ? callback : null);
    },
    addItemToCart: (email, itemId, quantity, callback = null ) => {
        return db.query("INSERT INTO cart_items (email, item_id, quantity) VALUES($1, $2, $3)", [quantity, itemId, email], callback ? callback : null);
    },
}