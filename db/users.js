const db = require('./index');

module.exports = {
    getUser: (email) => {
        return db.query("SELECT * FROM users WHERE email = $1", [email]);
    },
    setResetToken: (email, token) => {
        return db.query(`UPDATE users SET reset_token = $1, token_expiry = now() + interval '15 minutes' WHERE email = $2`, [token, email]);
    },
    checkResetTokenValidity: (token) => {
        return db.query(`SELECT email FROM users WHERE token_expiry > now() AND reset_token = $1`, [token]);
    }
}