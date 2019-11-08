const db = require('../index');
const { expand } = require('./helperFunctions');

async function deletePurchaseHistory(user) {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');
        // get all of the user's past order
        const orderHistory = await client.query("SELECT id FROM orders WHERE email = $1", [user]);

        // create query
        const deleteOrderItemsQuery = "DELETE FROM order_items WHERE order_id IN " + expand(1, orderHistory.rows.length);

        // extract the id from the query results of orderHistory
        const orderIds = orderHistory.rows.map(item => item.id);

        // delete the order items
        await client.query(deleteOrderItemsQuery, orderIds);

        // delete the actual order
        await client.query("DELETE FROM orders WHERE email = $1", [user]);

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
    deletePurchaseHistory: deletePurchaseHistory
}
