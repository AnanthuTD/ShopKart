var createError = require("http-errors");
var express = require("express");
var path = require("path");
var logger = require("morgan");
var fileUpload = require("express-fileupload");
var dotenv = require("dotenv");
var handleBars = require("handlebars");
var helpers = require("handlebars-helpers")();
var db = require('./config/connection');
// var db = require("./config/CloudConnection");
var adminRouter = require("./routes/admin");
var usersRouter = require("./routes/users");
var configHelpers = require("./helpers/config-helpers");
var productHelpers = require("./helpers/product-helpers");

handleBars.registerHelper("inc", (value) => {
  return parseInt(value) + 1;
});

const app = express();

// creditials to mongodb atlas
const result = dotenv.config();
let uri = "";
if (result.error) {
  throw result.error;
} else {
  uri = process.env.DB_URI;
  connect();
}

let dbCount = 0
async function connect() {
  // session Storage
  require("./config/session")(uri, app);
  db.connect(uri, (err) => {
    if (err) { 
      console.log("!Error connecting to database : " + err); 
      console.log("Re-connecting ...");
      if (dbCount <= 2) {
        dbCount++
        connect() 
      } 
    }
    else {
      // creating index for search
      configHelpers.createIndex(db);
      productHelpers
        .initDB(db)
        .then()
        .catch((err) => {
          console.error(err);
        });
    }
  });
}

// view engine setup
var hbs = require("express-handlebars");

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layouts/",
    partialsDir: __dirname + "/views/partials",
    userDir: __dirname + "/views/partials",
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileUpload());

app.use("/admin", adminRouter);
app.use("/", usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
