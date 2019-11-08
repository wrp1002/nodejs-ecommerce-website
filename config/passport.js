const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20');

const bcrypt = require('bcryptjs');
const usersDB = require('../db/tables/users');

// Everything in this file was made by Dylan Hoefsloot

module.exports = function (passport) {

    passport.use('local', new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {

        try {

            usersDB.getUser(email, function (errorMessage, userInformation) {

                if (errorMessage) throw errorMessage

                if (userInformation.rowCount != 1) {
                    return done(null, false, { message: 'That email is not registered' })
                }

                databaseHash = userInformation.rows[0].password_hash;
                databaseSalt = userInformation.rows[0].salt;

                bcrypt.compare(password, databaseHash, (compareError, isMatch) => {

                    if (compareError) throw compareError

                    if (isMatch) return done(null, email)
                    else return done(null, false, { message: 'Password incorrect' })

                })
            });
           
        } catch (Error) { console.log(Error) }

    }));

passport.use('google', new GoogleStrategy({

    clientID: process.env.GoogleID,
    clientSecret: process.env.GoogleSecret,
    callbackURL: '/auth/google/callback'
},

    async (accessToken, refreshToken, userProfile, done) => {

        const googleInformation = userProfile._json

        usersDB.getUser(googleInformation.email,  async (errorMessage, userInformation) => {

            if (errorMessage) throw errorMessage

            if (userInformation.rowCount != 1) {

                usersDB.createNewOAuthUser(googleInformation.email, function (errorMessage, results) {

                    if (errorMessage) throw errorMessage

                    return done(null, results.rows[0].email)

                });
            }

            return done(null, userInformation.rows[0].email)

        });
    }))

passport.serializeUser(function (email, done) {
    done(null, email);
});

passport.deserializeUser(function (email, done) {
    done(null, email);
});

}
