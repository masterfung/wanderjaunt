import express from 'express';
import path from 'path';
import logger from 'morgan';
import bodyParser from 'body-parser';
import flash from 'connect-flash';
import session from 'express-session';
import favicon from 'serve-favicon';
import cookieParser from 'cookie-parser';

import mongoose from 'mongoose';

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/wanderjaunt', { useMongoClient: true });

// import Inventory from "./models/Inventory";
// import Property from "./models/Property";
// import Cart from "./models/Cart";
require('./models/Inventory');
require('./models/Property');
require('./models/Cart');
require('./models/Expiration');

let index = require('./routes/index');
let users = require('./routes/users');

let app = express();

app.use(session({ cookie: { maxAge: 60000 },
                  secret: 'woot',
                  resave: false,
                  saveUninitialized: false}));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
