
const db = require('../config/connection');
const { Db, ObjectId } = require('mongodb');
var bcrypt = require('bcrypt');
const collections = require('../config/collections');

module.exports = {

    doSignup: (userData) => {

        return new Promise(async (resolve, reject) => {

            userData.password = await bcrypt.hash(userData.password, 12);
            var id = await db.get().collection(collections.USER_COLLECTION).count() + 1;
            userData._id = id
           
            if (await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email })) {

                resolve({ status: false })
            }
            else {
                db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {

                    resolve({ status: true });
                    console.log("success");
                })
            }



        })
    },

    doLogin: (userData) => {

        return new Promise(async (resolve, reject) => {

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
                    console.log("Login faild ! ")
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

        return new Promise(async (resolve, reject) => {
            // get products in the cart
            db.get().collection(collections.USER_COLLECTION).findOne({ _id: ObjectId(userId) }).then(async (userData) => {

                if (userData.cart)
                    var products = await db.get().collection(collections.PRODUCT_COLLECTION).find({ _id: { $in: userData.cart } }).toArray();

                resolve(products);
            })
        })



    },

    removeProduct: (proId, userId) => {

        console.log(userId);
        return new Promise((resolve, reject) => {

            db.get().collection(collections.USER_COLLECTION).updateOne({ "_id": ObjectId(userId) }, { $pull: { "cart": ObjectId(proId) } }).then((res) => {
                console.log(res);
                resolve({ status: true });
            }).catch((err) => {
                reject({ status: false })
            })
        })
    }

}
