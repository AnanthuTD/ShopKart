var session = require('express-session')
var MongoStore = require('connect-mongo')


module.exports = async (app) => {
    let uri = process.env.DB_URI;
    try {
        app.use(session({
            secret: 'key', cookie: { maxAge: 1 * 60 * 60 * 1000 }, // = 1hour //hh:mm:ss:millisec
            resave: false, saveUninitialized: false,
            store: MongoStore.create({
                mongoUrl: uri

            })
        })
        )
    }
    catch(error){
        console.error('session error',error);
        /* app.use(session({
            secret: 'key', cookie: { maxAge: 1 * 60 * 60 * 1000 }, // = 1hour //hh:mm:ss:millisec
            resave: false, saveUninitialized: false,
            store: MongoStore.create({
                mongoUrl: 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.1'

            })
        })
        ) */
    }
}
