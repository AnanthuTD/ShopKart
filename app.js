var createError = require('http-errors');
var express = require('express');
var path = require('path');
//var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload = require('express-fileupload')
var db = require('./config/connection');
var productHelpers = require('./helpers/product-helpers');
var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
var promise = require('promise');
var session = require('express-session')

var app = express();

// view engine setup
var hbs = require('express-handlebars');
const { resolve } = require('path');
const { Cookie } = require('express-session');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({
  extname: 'hbs',
  defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials'
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(session({
  secret: 'key', cookie: { maxAge: 1*60*60*1000}, // = 1hour //hh:mm:ss:millisec
  resave: false, saveUninitialized: false
}));

db.connect((err) => {
  if (err) console.log('!Error connecting to database : ' + err);
  else console.log('database created');
})
app.use('/admin', adminRouter);
app.use('/admin/user', adminRouter);
app.use('/', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
