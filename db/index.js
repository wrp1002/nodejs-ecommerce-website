const { Pool } = require('pg');


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

module.exports = {
    query: (text, params, callback) => {
        if (callback == null) {
            return pool.query(text, params);
        } else {
            return pool.query(text, params, callback);
        }
    },
    getClient: (callback) => {
        pool.connect(callback);
    },
    pool: pool
}