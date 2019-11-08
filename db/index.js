const { Pool } = require('pg');

/*
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});
*/

// Used to local testing
const pool = new Pool({
    user: 'eqoaufryrlziba',
    host: 'ec2-54-235-104-136.compute-1.amazonaws.com',
    database: 'debldnvrsqnjov',
    password: 'ca96d213b57dca84daf23d6c6e76840266b0aa26f73bbf30bff67f81d84002ff',
    port: 5432,
    ssl: true
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
    }
}