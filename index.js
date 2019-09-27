const express = require('express');
const path = require('path');

var bodyParser = require("body-parser");
var controller = require('./controllers/index.js');

const PORT = process.env.PORT || 5000;

app = express();

controller(app);

app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .use(express.json())
  .use(function (req, res, next) {
      // Website you wish to allow to connect
      res.setHeader('Access-Control-Allow-Origin', '*')
      // // Request methods you wish to allow
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      // Request headers you wish to allow ,
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-ControlAllow-Headers');
      // Pass to next layer of middleware
      next();
  })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
  
  //app.use(express.static('./public'));  
  