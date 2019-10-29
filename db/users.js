const db = require('./index');

module.exports = {
    getUser: (email) => {
        return db.query("SELECT * FROM users WHERE email = $1", [email]);
    },
    setResetToken: (email, token) => {
        return db.query(`UPDATE users SET reset_token = $1, token_expiry = to_timestamp($2 / 1000.0) WHERE email = $3`, [token, Date.now() + 900000, email]);
    }
}