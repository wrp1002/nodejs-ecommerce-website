const db = require('./index');

module.exports = {
    getUser: (email, callback = null) => {
        return db.query("SELECT * FROM users WHERE email = $1", [email], callback ? callback : null);
    },
    getAccountType: (user, callback = null) => {
        return db.query("SELECT account_type FROM users WHERE email = $1", [user], callback ? callback : null);
    },
    setResetToken: (email, token, callback = null) => {
        return db.query(`UPDATE users SET reset_token = $1, token_expiry = now() + interval '15 minutes' WHERE email = $2`, [token, email], callback ? callback : null);
    },
    checkResetTokenValidity: (token, callback = null) => {
        return db.query(`SELECT email FROM users WHERE token_expiry > now() AND reset_token = $1`, [token], callback ? callback : null);
    },
    createNewUser: (email, hash, callback = null) => {
        return db.query(`INSERT INTO users (email, password_hash) VALUES ($1, $2)`, [email, hash], callback ? callback : null);
    },
    updateUserHash: (token, hash, callback = null) => {
        return db.query(`UPDATE users SET password_hash = $2, reset_token = NULL, token_expiry = NULL WHERE reset_token = $1`, [token, hash], callback ? callback : null);
    },
    removeResetToken: (email, callback = null) => {
        return db.query(`UPDATE users SET reset_token = NULL, token_expiry = NULL WHERE email = $1`, [email], callback ? callback : null);
    }
}