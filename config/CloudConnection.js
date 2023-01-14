const { MongoClient, ServerApiVersion } = require('mongodb');

const status = {
    db: null
}

module.exports.connect = async function(uri, done){
    const dbname = 'ShopKart';
    let mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });;
 
    try {
        mongoClient = new MongoClient(uri);
        console.log('Connecting to MongoDB Atlas cluster...');
        await mongoClient.connect(err => {
            if (err) return done(err);
    
            console.log("Database connected!");
            status.db = mongoClient.db(dbname);
            return done()
    
            
        });;
        console.log('Successfully connected to MongoDB Atlas!');
 
        return mongoClient;
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        process.exit();
    }
}

module.exports.get = function () {
    return status.db;
}

