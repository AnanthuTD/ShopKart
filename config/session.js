var session = require('express-session')
var MongoStore = require('connect-mongo')
var collections = require('../config/collections')
var MongoClient = require('mongodb').MongoClient;
var db = require('../config/connection')

module.exports = async(app) => {
    

    app.use(session({
        secret: 'key', cookie: { maxAge: 1 * 60 * 60 * 1000 }, // = 1hour //hh:mm:ss:millisec
        resave: false, saveUninitialized: false,
        store: MongoStore.create({
        mongoUrl:'mongodb://localhost/ShopKart'

        })
    }));
}
