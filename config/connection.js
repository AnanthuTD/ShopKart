var MongoClient = require('mongodb').MongoClient;
const status = {
    db: null
}

module.exports.connect = function (uri, done) {
    //access database :
    const url = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.1';
    const dbname = 'ShopKart';
    console.log("connecting to DB(local)");
    // MongoClient.connect(url, function (err, db_url) {
    //     if (err) return done(err);
    //     console.log("Database connected!");
    //     status.db = db_url.db(dbname);
    //     return done()
    // });
    const mongoClient = new MongoClient(url);
    mongoClient.connect(function (err, client) {
        if (err) return done(err);
        console.log("Database connected!");
        status.db = client.db(dbname);
        return done()
    });
}

module.exports.get = function () {
    return status.db;
}