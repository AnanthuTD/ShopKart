'use strict'
// accessing db
var db;
const { ObjectId } = require('mongodb');
var collections = require('../config/collections');
var configHelpers = require('../helpers/config-helpers')
let Promise = require('promise');
const {checkObjectId, get_email_id} = require('./common_helpers')

module.exports = {

    initDB: function (DB) {

        return new Promise((resolve, reject) => {
            db = DB.get();
            resolve();
        })
    },
    addProduct: async (product) => {

        return new Promise((resolve, reject) => {

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

        return new Promise(async function (resolve, reject) {
            let products = await db.collection(collections.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        });
    },

    deleteProduct: (proId) => {

        return new Promise((resolve, reject) => {

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

        return new Promise(async (resolve, reject) => {

            db.collection(collections.PRODUCT_COLLECTION).findOne({ _id: ObjectId(proId) }).then((res) => {

                resolve(res);
            })

        }).catch((err) => {
            throw err;
        })
    },

    editProduct: (product, id) => {

        return new Promise((resolve, reject) => {

            db.collection(collections.PRODUCT_COLLECTION).updateOne({ _id: ObjectId(id) }, { $set: product }).then((response) => {


                resolve("\nedit success\n");
            })
        })
    },

    buyNow: (product_id, user_id) => {
        return new Promise(async (resolve, reject) => {
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

    addProduct: async (userId, proId) => {
        userId = await checkObjectId(userId)
        return await new Promise(async (resolve, reject) => {
            db.collection(collections.CART)
                .updateOne(
                    {
                        _id: userId,
                        'cart.proId':
                        {
                            $not:
                            {
                                $eq:
                                    ObjectId(proId)
                            }
                        }
                    },
                    {
                        $push:
                        {
                            cart:
                            {
                                proId:
                                    ObjectId(proId), quantity: 1
                            }
                        }
                    },
                    {
                        upsert: true
                    }
                ).then((res) => {
                    // console.log('\n Product Successfully added to cart \n');
                    resolve({ status: true });
                }).catch((err) => {
                    if (err.name == 'MongoServerError' && err.code === 11000) {
                        // console.log("\n Item already exist in the cart \n");
                        db.collection(collections.CART)
                            .updateOne(
                                {
                                    _id: userId, 'cart.proId': ObjectId(proId)
                                },
                                {
                                    $inc:
                                    {
                                        'cart.$.quantity': 1
                                    }
                                }
                            )
                            .catch((err) => {
                                console.warn('product increment failed' + err);
                            })

                        resolve({ status: true });
                    }
                    else {
                        throw new Error(err);
                    }
                })
        });
    },

    removeProduct: async (proId, userId) => {
        userId = await checkObjectId(userId)
        return new Promise((resolve, reject) => {
            db.collection(collections.CART)
                .updateOne(
                    {
                        "_id": userId
                    },
                    {
                        $pull:
                        {
                            'cart':
                            {
                                'proId': ObjectId(proId)
                            }
                        }
                    }
                ).then((res) => {

                    resolve({ status: true });

                }).catch((err) => {

                    console.log('\n......Remove product faild......\n' + err);
                    reject({ status: false })
                })
        })
    },

    searchProducts: (search) => {
        return new Promise(async (resolve, reject) => {
            var query = { $text: { $search: search } };
            var result = await db.get().collection(collections.PRODUCT_COLLECTION).find(query).toArray();
            resolve(result)
        })
    },

   

}