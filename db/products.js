const db = require('./index');

// This file was written by Wesley Paglia

module.exports = {
    addProduct: (name, description, price, image_path, category, callback = null) => {
        return db.query("INSERT INTO products (name, description, price, image_path, category) values ($1, $2, $3, $4, $5)", [name, description, price, image_path, category], callback ? callback : null);
    },
    getProductRecommendation: (search, callback = null ) => {
        return db.query("select * from products where upper(category) LIKE upper('%' || $1 || '%')", [search], callback ? callback : null);
    },
    searchProducts: (search, callback = null ) => {
        return db.query("select * from products where upper(name) LIKE upper('%' || $1 || '%') OR upper(description) LIKE upper('%' || $1 || '%') OR upper(category) LIKE upper('%' || $1 || '%')", [search], callback ? callback : null);
    }
}