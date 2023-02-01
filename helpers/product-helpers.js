// accessing db
var db;

var collections = require('../config/collections');

var configHelpers = require('../helpers/config-helpers')
const { ObjectId } = require('mongodb');
var promise = require('promise');

function checkObjectId(id) {
    var objId
    try {
        objId = ObjectId(id)
    }
    catch (error) {
        objId = id
    }
    return (objId)
}


module.exports = {

    initDB: function (DB) {

        return new promise((resolve, reject) => {
            db = DB.get();
            resolve();
        })
    },
    addProduct: async (product) => {

        return new promise((resolve, reject) => {

            db.collection(collections.PRODUCT_COLLECTION).insertOne(product).then((data) => {

                var id = (data.insertedId).toString();
                configHelpers.createIndex(db)

                resolve(id)
            }).catch((err) => { console.log('product insertion faild' + err); })
        })

    },

    addImage: async (productImage, id) => {

        var myquery = { _id: ObjectId(id) };
        var newvalues = { $set: { img: productImage } };

        db.collection(collections.PRODUCT_COLLECTION).updateOne(myquery, newvalues, function (err, res) {
            if (err) throw err;
        });
    },

    getAllProducts: () => {

        return new promise(async function (resolve, reject) {
            let products = await db.collection(collections.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        });
    },

    deleteProduct: (proId) => {

        return new promise((resolve, reject) => {

            db.collection(collections.PRODUCT_COLLECTION).deleteOne({ _id: ObjectId(proId) }).then((res) => {
                console.log('\n.....Product deleted successfully.....\n');
                configHelpers.createIndex(db)
                resolve({ status: true });
            }).catch((err) => {
                console.log('\n......Product deletion faild......\n' + err);
                reject({ status: false })
            })
        })
    },

    getProduct: (proId) => {

        return new promise(async (resolve, reject) => {

            db.collection(collections.PRODUCT_COLLECTION).findOne({ _id: ObjectId(proId) }).then((res) => {

                resolve(res);
            })

        }).catch((err) => {
            throw err;
        })
    },

    editProduct: (product, id) => {

        return new promise((resolve, reject) => {

            db.collection(collections.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: product }).then((response) => {


                resolve("\nedit success\n");
            })
        })
    },

    buyNow: (product_id, user_id) => {
        return new promise(async (resolve, reject) => {
            user_id = await checkObjectId(user_id)
            var order = await db.collection(collections.USER_COLLECTION).aggregate([
                {
                    $match: {
                        _id: user_id
                    }
                },
                {
                    $project: {
                        address: '$address1',
                        _id: 0
                    }
                },
                {
                    $addFields: { 'userId': user_id, "Order_date": "$$NOW", 'status': 'pending', 'DeliveryDate': null, 'proId': [{'proId':ObjectId(product_id), 'quantity':1}] }
                },
            ]).toArray();
           
            order = order[0]
            var orderId = ''
            await db.collection(collections.ORDER).insertOne(order).catch((err) => {
                console.error(err);
            }).then((res) => {
                orderId = (res.insertedId)
            })
            if (order) {
                var response = {
                    status: true,
                    orderId: orderId,
                    quantity: 1
                }
                resolve(response)
            }
            else
                reject({ status: false })
        })

    },

}