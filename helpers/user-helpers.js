
const db = require('../config/connection');
const { Db, ObjectId } = require('mongodb');
var bcrypt = require('bcrypt');
const collections = require('../config/collections');
const { resolve, reject } = require('promise');

module.exports = {

    doSignup: (userData) => {

        return new Promise(async (resolve, reject) => {

            userData.password = await bcrypt.hash(userData.password, 12);

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

    doLogin: async (userData) => {

        try {
            return await new Promise(async (resolve, reject) => {

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

                            resolve(response);
                        }

                    }).catch((err) => {
                        console.log("Login faild ! ");
                        throw err;
                    });
                }
            });
        } catch (err_1) {
            resolve({ status: false });
            throw err_1;
        }
    },

    addProduct: async (userId, proId) => {

        try {
            return await new Promise(async (resolve, reject) => {

                db.get().collection(collections.USER_COLLECTION).updateOne({ _id: ObjectId(userId), cart: { $not: { $eq: ObjectId(proId) } } }, { $push: { cart: {proId: ObjectId(proId), quantity: 1}} }).then((res) => {

                    console.log(res);
                    if (res.modifiedCount == 0) {
                        console.log("\n Item already exist in the cart \n");
                        // db.get().collection(collections.USER_COLLECTION).updateOne({})
                        resolve({status: false});
                    }
                    else {
                        console.log('\n Product Successfully added to cart \n');
                        resolve({status: true});
                    }

                   
                }).catch((err) => {
                    console.log('err adding products to cart' + err);
                })

            });
        } catch (err) {
            throw err;
        }
    },

    getAllProducts: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            // get products in the cart
            db.get().collection(collections.USER_COLLECTION).findOne({ _id: ObjectId(userId) }).then(async (userData) => {
                console.log(userData);

                if (userData.cart)
                    var products = await db.get().collection(collections.PRODUCT_COLLECTION).find({ _id: { $in: userData.cart } }).toArray();

                console.log(products);
                resolve(products);
            }).catch((err) => {
                console.log('err finding user id in user-collections' + err);
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

                console.log('\n......Remove product faild......\n' + err);
                reject({ status: false })
            })
        })
    },

    cartCount: (userId) => {

        return new Promise(async (resolve, reject)=>{

            console.log('count');
            var count = await db.get().collection(collections.USER_COLLECTION).aggregate([{
                $match: { _id: ObjectId(userId) }
            }, { $project: { count: {$cond: {if: {$isArray: "$cart"}, then:{ $size: "$cart" }, else: 0}} } }]).toArray();
            resolve(count[0].count);
        })
    }

}
