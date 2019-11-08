const cart_items = require("./tables/cart_items");
const order_items = require("./tables/order_items");
const orders = require("./tables/orders");
const products = require("./tables/products");
const users = require("./tables/users");

module.exports = {
    cart: cart_items,
    users: users,
    orders: orders,
    products: products,
    orderItems: order_items
}