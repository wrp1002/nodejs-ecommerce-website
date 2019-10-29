const bcrypt = require('bcryptjs');

module.exports = {
    generateSaltedHash: (saltRounds, password) => {
        return bcrypt.hash(password, saltRounds)
            .then(hash => {
                return hash;
            })
            .catch(err => {
                throw err;
            });
    }
};