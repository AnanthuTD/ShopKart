var MongoClient = require('mongodb').MongoClient;
const collections = require('./collections');
const status = {
    db:null
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
        // creating index for search
        status.db.collection(collections.PRODUCT_COLLECTION).createIndex({ name: "text" })
        
        return done()

    });
    

}

module.exports.get = function(){
    return status.db;
}