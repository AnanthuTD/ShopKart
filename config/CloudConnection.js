'use strict'
const { MongoClient, ServerApiVersion } = require("mongodb");
let Promise = require('promise')


const status = {
    db: null,
};

let connectionCount = 0
module.exports.connect = function () {
    return new Promise((resolve, reject) => {
        const dbname = 'ShopKart';
        const uri = process.env.DB_URI;

        try {
            let mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
            status.db = mongoClient.db(dbname);
            resolve()
        }
        catch (error) {

            if (connectionCount <= 2) {
                console.warn("Re-connecting ...");
                connectionCount++
                this.connect().catch(() => reject()).then(() => resolve())
            }
            else {
                console.error('Connection to MongoDB Atlas failed!', error);
                reject()
            }
        }
    })

}

module.exports.get = function () {
    return status.db;
};

module.exports.uri = () => {
    return process.env.DB_URI;
}