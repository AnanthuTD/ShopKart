
const db = require('../config/connection');
var promise = require('promise');
const { Db, ObjectId } = require('mongodb');
var bcrypt = require('bcrypt');
const { resolve, reject } = require('promise');
const { response } = require('../app');
const collections = require('../config/collections');

module.exports = {

    doSignup: (userData) => {

        return new promise(async (resolve, reject) => {

            userData.password = await bcrypt.hash(userData.password, 12);

            db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {

                resolve(data.insertedId);
            })

        })
    },

    doLogin: (userData) => {

        return new promise(async (resolve, reject) => {

            let response = {};


            var user = await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email });

            if (user) {

                bcrypt.compare(userData.password, user.password).then((flag) => {

                    if (flag) {

                        console.log('login success');
                        response.status = true;
                        response.details = user;

                        resolve(response);
                    }
                    else {

                        console.log('login faild');
                        response.status = false;

                        resolve(response)
                    }

                }).catch((err) => {
                    throw err;
                })
            }
        }).catch((err) => {

            resolve({ status: false })
            throw err;
        })
    },

    getProductInfo: (userId, proId) => {

        return new Promise(async (resolve, reject) => {

            proId = await ObjectId(proId);

            db.get().collection(collections.USER_COLLECTION).updateOne({ _id: ObjectId(userId), cart: { $not: { $eq: proId } } }, { $push: { cart: proId } }).then((res) => {

                if (res.modifiedCount == 0) {
                    console.log("\n Item already exist in the cart \n");
                }
                else {
                    console.log('\n Product Successfully added to cart \n');
                }

                resolve();
            })

        }).catch((err) => {
            throw err;
        })
    },

    getAllProducts: (userId) => {

        return new Promise(async(resolve, reject) => {
            // get products in the cart
            db.get().collection(collections.USER_COLLECTION).findOne({ _id: ObjectId(userId) }).then(async (userData) => {

                var products = await db.get().collection(collections.PRODUCT_COLLECTION).find({ _id: { $in: userData.cart } }).toArray();
                console.log(products)
                resolve(products);
            })
        })



    }

}
