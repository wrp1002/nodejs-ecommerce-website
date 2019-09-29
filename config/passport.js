const LocalStrategy = require('passport-local').Strategy;
const OAuthStrategy = require('passport-oauth').OAuthStrategy;
const GoogleStrategy = require('passport-google-oauth20');

const bcrypt = require('bcryptjs');
const pg = require('pg');

const databasePool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

module.exports = function(passport) {
        
    passport.use('local', new LocalStrategy({ usernameField: 'email' }, async(email, password, done) => {

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

    }));

    passport.use('google', new GoogleStrategy({
            
        clientID: process.env.GoogleID,
        clientSecret: process.env.GoogleSecret
    }, 

    async(accessToken, refreshToken, userProfile, done) => {
        
        const client = await databasePool.connect();

        await client.query("SELECT * FROM users WHERE email = $1", [email], async(errorMessage, userInformation) => {
            
            if(errorMessage) throw errorMessage

            if(userInformation.rowCount != 1){
                
                await client.query("INSERT INTO users (email) VALUES ($1)", [userProfile.email], function(errorMessage, results) {

                    return done(null, userProfile.email)

                })
            }

            return done(null, userInformation.rows[0].email)
            
        })
    }))
    
    passport.serializeUser(function(email, done) {
        done(null, email);
    });
    
    passport.deserializeUser(function(email, done) {
        done(null, email);
    });

}