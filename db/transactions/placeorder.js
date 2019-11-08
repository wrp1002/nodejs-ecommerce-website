const db = require('../index');
const { expand } = require('./helperFunctions');

async function placeOrder(user, totalPrice) {
    const client = await db.pool.connect();

    try {
        await client.query('BEGIN');
        // insert order to orders
        const orderResults = await client.query("INSERT INTO orders (email, total_price) values ($1, $2) RETURNING *;", [user, totalPrice]);

        const orderID = orderResults.rows[0].id;

        // get item details of products in cart
        const cartItems = await client.query("SELECT item_id, quantity FROM cart_items WHERE email = $1", [user]);

        // put all needed variables from each row in array to be used in query later
        const variableArray = cartItems.rows.reduce((array, item) => {
            array.push(orderID, item.item_id, item.quantity);
            return array;
        }, []);

        // insert query that calls expand to create the value variable placeholders
        const insertQuery = "INSERT INTO order_items (order_id, product_id, quantity) VALUES" + expand(cartItems.rows.length, 3);

        // insert all the items from cart into order items
        await client.query(insertQuery, variableArray);

        // delete all items in cart since its been ordered
        await client.query("DELETE FROM cart_items where email= $1", [user]);

        // end query
        await client.query('COMMIT');
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

module.exports = {
    placeOrder: placeOrder
}
