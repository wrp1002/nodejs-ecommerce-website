const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

module.exports = function(passport) {
        
    passport.use(
        
        new LocalStrategy({ usernameField: 'email' }, async(email, password, done) => {

            try {
            
                const client = await databasePool.connect();

                await client.query("SELECT * FROM users WHERE email = $1", [email], function(errorMessage, userInformation) {
                    
                    if(errorMessage) throw errorMessage

                    if(userInformation.rowCount != 1){
                        return done(null, false, { message: 'That email is not registered' })
                    }
                    
                    databaseHash = userInformation.rows[0].password_hash;
                    databaseSalt = userInformation.rows[0].salt;
    
                    bcrypt.compare(password, databaseHash, (compareError, isMatch) => {

                        if(compareError) throw compareError

                        if(isMatch) return done(null, email)
                        else return done(null, false, { message: 'Password incorrect' })

                    })
                })

            } catch(Error){ console.log(Error) }

        })
    );
    
    passport.serializeUser(function(email, done) {
        done(null, email);
    });
    
    passport.deserializeUser(function(email, done) {
        done(null, email);
    });

}