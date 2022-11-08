const { MongoClient, ServerApiVersion } = require('mongodb');

const status = {
    db: null
}

module.exports.connect = function (done) {
    const uri = "mongodb+srv://Ananthu:Ananthutdcr7%23@shopcart.2p5tjnh.mongodb.net/?retryWrites=true&w=majority";
    const dbname = 'ShopKart';

    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    client.connect(err => {
        if (err) return done(err);

        console.log("Database connected!");
        status.db = client.db(dbname);
        return done()
    });
}

module.exports.get = function () {
    return status.db;
}

