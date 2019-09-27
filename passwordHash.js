const sjcl = require('sjcl');
const csprng = require('csprng');

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

const hashIterations = 1000;
const pseudoRandomFucntion = sjcl.misc.hmac;
const saltLength = 1000;

function updatePassword(receivedPassword, receivedEmail){

    const generatedSalt = csprng(saltLength, 36);
    const passwordHash = sjcl.misc.pbkdf2(receivedPassword, generatedSalt, hashIterations, generatedSalt.length, pseudoRandomFucntion);
   
    return new Promise(function(resolve, reject) {
        
        return new Promise(async() => {
            
            try {   
                
                const client = await pool.connect();
                
                if(!client){
                    return reject("Problem connecting to database");
                }

                await client.query("UPDATE users SET password_hash = $1, salt = $2 WHERE email = $3", [passwordHash, generatedSalt, receivedEmail], function(errorMessage, results) {
                    
                    if(errorMessage) return reject("Problem updating user information into the database: " + String(errorMessage));

                    console.log("Updated " + receivedEmail + ", " + passwordHash + ", " + generatedSalt + " in the database");

                    return resolve("Successfully updated hash and salt");

                })

            } catch(Exception) { return reject(Exception); }
        
        })
    })
}

function storePassword(receivedPassword, receivedEmail){
    
    const generatedSalt = csprng(saltLength, 36);
    const passwordHash = sjcl.misc.pbkdf2(receivedPassword, generatedSalt, hashIterations, generatedSalt.length, pseudoRandomFucntion);
   
    return new Promise(function(resolve, reject) {
        
        return new Promise(async() => {
            
            try {   
                
                const client = await pool.connect();
                
                if(!client) return reject("Problem connecting to database");
                
                await client.query("INSERT INTO users (email, password_hash, salt) VALUES ($1, $2, $3)", [receivedEmail, passwordHash, generatedSalt], function(errorMessage, results) {
                    
                    if(errorMessage) return reject("Problem inserting user information into the database: " + String(errorMessage));

                    console.log("Inserted " + receivedEmail + ", " + passwordHash + ", " + generatedSalt + " into the database");

                    return resolve("Successfully stored hash and salt");
                })

            } catch(Exception) { return reject(Exception); }
        
        })
    })
}

function validatePassword(receivedPassword, receivedEmail){

    var databaseHash;
    var databaseSalt;

    var asyncPromise = new Promise(function(resolve, reject){
        
        return new Promise(async() => {
            
            try {
                
                const client = await pool.connect();
                
                if(!client){
                    return reject("Problem connecting to database");
                }

                await client.query("SELECT * FROM users WHERE email = $1", [receivedEmail], function(errorMessage, userInformation) {
                    
                    if(errorMessage) return reject("Problem getting user information from database: " + String(errorMessage));

                    if(userInformation.rowCount != 1){
                        return reject("Could not find user in table");
                    }
    
                    databaseEmail = userInformation.rows[0].email;
                    databaseHash = userInformation.rows[0].password_hash;
                    databaseSalt = userInformation.rows[0].salt;
    
                    console.log("Retrieved " + databaseEmail + ", " + databaseHash + ", " + databaseSalt + " from the database");
    
                    return resolve("Successfully retrieved hash and salt");
                })

            } catch(Exception){ return reject(Exception); }

        })
    })

    asyncPromise.then(function(promiseResult){

        const passwordHash = String(sjcl.misc.pbkdf2(receivedPassword, databaseSalt, hashIterations, databaseSalt.length, pseudoRandomFucntion));

        console.log("Hash for entered password is " + passwordHash + " of length " + passwordHash.length);
        console.log("Hash in database is " + databaseHash + " of length " + databaseHash.length);

        var hashDiff = databaseHash.length ^ passwordHash.length;
        for(var i = 0; i < databaseHash.length && i < passwordHash.length; ++i){
            hashDiff |= databaseHash[i] ^ passwordHash[i];
        }

        if(hashDiff == 0) return true;
        else return false;

    }).catch(function(Error){
        return Error;
    })
}

module.exports = {
    testFunction: function(){
        
        updatePassword("password", "test1@gmail.com")
        .then(validatePassword("password", "test1@gmail.com"))
        .then(updatePassword("reset", "test1@gmail.com"))
        .then(validatePassword("reset", "test1@gmail.com"))
        .catch(function(Error){ console.error(String(Error)) })
    }
}

