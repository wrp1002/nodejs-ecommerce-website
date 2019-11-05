const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20');

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

/*
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});
*/

// Used to local testing

const databasePool = new Pool({
    user: 'eqoaufryrlziba',
    host: 'ec2-54-235-104-136.compute-1.amazonaws.com',
    database: 'debldnvrsqnjov',
    password: 'ca96d213b57dca84daf23d6c6e76840266b0aa26f73bbf30bff67f81d84002ff',
    port: 5432,
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
        clientSecret: process.env.GoogleSecret,
        callbackURL: '/auth/google/callback'
    }, 

    async(accessToken, refreshToken, userProfile, done) => {
        
        const googleInformation = userProfile._json

        const client = await databasePool.connect();

        await client.query("SELECT * FROM users WHERE email = $1", [googleInformation.email], async(errorMessage, userInformation) => {
            
            if(errorMessage) throw errorMessage

            if(userInformation.rowCount != 1){
                
                await client.query("INSERT INTO users (email) VALUES ($1)", [googleInformation.email], function(errorMessage, results) {

                    if(errorMessage) throw errorMessage

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
