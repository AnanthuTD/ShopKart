const { MongoClient, ServerApiVersion } = require("mongodb");

const status = {
  db: null,
};

module.exports.connect = async (uri, done) => {
  // const uri =
  //     "mongodb+srv://Ananthu:Ananthutdcr7%23@shopcart.2p5tjnh.mongodb.net/?retryWrites=true&w=majority";
  const dbname = "ShopKart";

  let mongoClient = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

module.exports.connect = function (uri, done) {
    const dbname = 'ShopKart';
    let mongoClient = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });;
    try {
        mongoClient = new MongoClient(uri);
        console.log('Connecting to MongoDB Atlas cluster...');
        mongoClient.connect(err => {
            if (err)
                return done(err);
            status.db = mongoClient.db(dbname);
            console.log('Successfully connected to MongoDB Atlas!');
            return done();
        })

    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        process.exit();
    }
}

module.exports.get = function () {
  return status.db;
};
