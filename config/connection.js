let Promise = require('promise');
var MongoClient = require('mongodb').MongoClient;

const status = {
    db: null
}

let connectionCount = 0
module.exports.connect = function () {
    return new Promise((resolve, reject) => {
        const uri = process.env.LOCAL_DB
        // const uri = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+1.6.1';
        const dbname = 'ShopKart';
        try {
            const client = new MongoClient(uri);
            status.db = client.db(dbname);
            resolve()
        }
        catch (error) {

            if (connectionCount <= 2) {
                console.warn("Re-connecting ...");
                connectionCount++
                this.connect().catch(() => reject()).then(() => resolve())
            }
            else {
                console.error("\x1b[41m%s\x1b[0m",'Connection to MongoDB (local) failed!', error);
                reject()
            }
        }

    })

}

module.exports.get = function () {
    return status.db;
}

module.exports.uri = ()=>{
    return process.env.LOCAL_DB
}
