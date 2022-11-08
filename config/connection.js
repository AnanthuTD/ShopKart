var MongoClient = require('mongodb').MongoClient;
const collections = require('./collections');
let promise = require('promise');
const { resolve, reject } = require('promise');
const status = {
    db: null
}

module.exports.connect = function (done) {

    //access database :
    const url = "mongodb://localhost:27017/";
    const dbname = 'ShopKart';

    MongoClient.connect(url, function (err, db_url) {
        if (err) return done(err);

        console.log("Database connected!");
        status.db = db_url.db(dbname);
        console.log("Database created!");
    
        return done()
    });


}

module.exports.get = function () {
    return status.db;
}