sjcl = require('sjcl');
csprng = require('csprng');

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

    console.log("Salt: " + generatedSalt)

    const passwordHash = sjcl.misc.pbkdf2(receivedPassword, generatedSalt, hashIterations, generatedSalt.length, pseudoRandomFucntion);
    
    console.log("Hash: " + passwordHash);
   
    var asyncPromise = async(receivedEmail) => {

        try {
            
            const client = await pool.connect();
            
            if(!client){
                console.log("Problem connection to database");
                return;
            }

            const insertSuccess = await client.query('INSERT INTO users VALUES (\'' + receivedEmail + '\', \'' + passwordHash + '\', \'' + generatedSalt + '\');');

            if(!insertSuccess){
                console.log("Problem inserting new user into the database");
                return;
            }

        } catch(Exception) {
            console.log("Caught exception: " + Exception);
            return;
        }
    }

    Promise.all(asyncPromise).catch(Error);
    
}

function validatePassword(receivedPassword, receivedEmail){

    var databaseHash;
    var databaseSalt;

    var asyncPromise = async(receivedEmail) => {

        try {
            
            const client = await pool.connect();
            
            if(client == null){
                console.log("Problem connection to database");
            }

            const userInformation = await client.query("SELECT * FROM users WHERE email=\'" + receivedEmail + "\':;");

            if(userInformation == null){
                console.log("Problem getting user information from database");
            }

            console.log("Database information: " + userInformation);

        } catch(Exception){

            console.log("Caught exception: " + Exception);
            return;
        }
    }

    Promise.all(asyncPromise).catch(Error);

    databaseHash = "asdasdhjk";
    databaseSalt = "asdasdasd";

    const passwordHash = sjcl.misc.pbkdf2(receivedPassword, databaseSalt, hashIterations, databaseSalt.length, pseudoRandomFucntion);

    var hashDiff = databaseHash.length ^ passwordHash.length;
    for(var i = 0; i < databaseHash.length && i < passwordHash.length; ++i){
        hashDiff |= databaseHash[i] ^ passwordHash[i];
    }

    if(hashDiff == 0){
        console.log("Success");
    }
    else {
        console.log("Failure");
    }
}

module.exports = {
    testFunction: function(){
        storePassword("password", "test1@gmail.com")
        console.log("----------------------------------------");
        validatePassword("password", "test1@gmail.com");
        console.log("----------------------------------------");
        //validatePassword("hacker", "test1@gmail");
    }
}

