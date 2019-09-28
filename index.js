const express = require('express');
const path = require('path');
const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');

const PORT = process.env.PORT || 5000;

// Passport Config
require('./config/passport')(passport);

const app = express();

// Express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .use(express.json())
  .use(express.urlencoded({extended: true}))
  .use('/users', require('./controllers/users.js'))
  .use('/', require('./controllers/index.js'))
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
  
app.listen(PORT, () => console.log(`Listening on ${ PORT }`))  