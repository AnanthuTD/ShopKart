var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var fileUpload = require('express-fileupload')
// var db = require('./config/connection');
var db = require('./config/CloudConnection');
var adminRouter = require('./routes/admin');
var usersRouter = require('./routes/users');
var handleBars = require('handlebars')
var helpers = require('handlebars-helpers')();
var configHelpers = require('./helpers/config-helpers');
var productHelpers = require('./helpers/product-helpers');
var userHelpers = require('./helpers/user-helpers');

handleBars.registerHelper("inc", (value) => {
  return parseInt(value) + 1;
})

const app = express();

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
  partialsDir: __dirname + '/views/partials',
  userDir: __dirname + '/views/partials',
}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

// local database
db.connect((err) => {
  if (err) console.log('!Error connecting to database : ' + err);
  else {
    // creating index for search
    configHelpers.createIndex(db);
    productHelpers.initDB(db).then().catch(err=>{console.error(err);});
  }
})

// session Storage
require('./config/session')(app)

app.use('/admin', adminRouter);
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
