const sjcl = require('sjcl');
const csprng = require('csprng');

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true
});

const hashIterations = 1000;
const pseudoRandomFucntion = sjcl.misc.hmac;
const saltLength = 160;

function storePassword(receivedPassword, receivedEmail){
    
    const generatedSalt = csprng(saltLength, 36);
    const passwordHash = sjcl.misc.pbkdf2(receivedPassword, generatedSalt, hashIterations, generatedSalt.length, pseudoRandomFucntion);
   
    return new Promise(function(resolve, reject) {
        
        return new Promise(async() => {
            
            try {   
                
                const client = await pool.connect();
                
                if(!client){
                    reject("Problem connection to database");
                }

                const insertSuccess = await client.query('INSERT INTO users VALUES (\'' + receivedEmail + '\', \'' + passwordHash + '\', \'' + generatedSalt + '\');');
                
                if(!insertSuccess){
                    reject("Problem inserting new user into the database");
                }

                console.log("Inserted " + receivedEmail + ", " + passwordHash + ", " + generatedSalt + " into the database");

                resolve("Successfully stored hash and salt");

            } catch(Exception) {
                reject(Exception);
            }
        
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
                    reject("Problem connection to database");
                }

                const userInformation = await client.query("SELECT * FROM users WHERE email=\'" + receivedEmail + "\';");
                
                if(!userInformation){
                    reject("Problem getting user information from database");
                }

                if(userInformation.rowCount != 1){
                    reject("Could not find user in table");
                }

                databaseHash = userInformation.rows[0].password_hash;
                databaseSalt = userInformation.rows[0].salt;

                console.log("Retrived hash " + databaseHash + " and salt " + databaseSalt + " from the database");

                resolve("Successfully retrieved hash and salt");

            } catch(Exception){
                reject(Exception);
            }
        })

    })

    asyncPromise.then(
        
        function(promiseResult){

            console.log("--------------------- " + promiseResult + " ---------------------") 

            const passwordHash = string(sjcl.misc.pbkdf2(receivedPassword, databaseSalt, hashIterations, databaseSalt.length, pseudoRandomFucntion));

            console.log("Hash for entered password is " + passwordHash + " of length " + passwordHash.length + " and type " + typeof passwordHash);
            console.log("Hash in database is " + databaseHash + " of length " + databaseHash.length + " and type " + typeof databaseHash);

            var hashDiff = databaseHash.length ^ passwordHash.length;
            console.log("Intial diff = " + hashDiff)
            for(var i = 0; i < databaseHash.length && i < passwordHash.length; ++i){
                hashDiff |= databaseHash[i] ^ passwordHash[i];
            }

            if(hashDiff == 0){
                console.log("Success");
                return true;
            }
            else {
                console.log("Failure");
                return false;
            }

        },
    
        function(promiseError) { console.log("--------------------- " + promiseError + " ---------------------") }
    
    ).catch(console.error)
}

module.exports = {
    testFunction: function(){
        
        storePassword("password", "test1@gmail.com")
        .then(
            function(promiseResult) { console.log("--------------------- " + promiseResult + " ---------------------") }, 
            function(promiseError) { console.log("--------------------- " + promiseError + " ---------------------") }
        )
        .then(validatePassword("password", "test1@gmail.com"))
        .catch(console.error)
    }
}

