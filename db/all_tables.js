const cart_items = require("./cart_items");
const order_items = require("./order_items");
const orders = require("./orders");
const products = require("./products");
const users = require("./users");

module.exports = {
    cart: cart_items,
    users: users,
    orders: orders,
    products: products,
    orderItems: order_items
}