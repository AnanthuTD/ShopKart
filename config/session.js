var session = require('express-session')
var MongoStore = require('connect-mongo')

module.exports = async (app, uri) => {
    app.use(session({
        secret: 'key', cookie: { maxAge: 1 * 60 * 60 * 1000 }, // = 1hour //hh:mm:ss:millisec
        resave: false, saveUninitialized: false,
        store: MongoStore.create({
           mongoUrl: uri
        })
    }));
}
