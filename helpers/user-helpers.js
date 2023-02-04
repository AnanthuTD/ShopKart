"use strict"
// var db = require('../config/CloudConnection')
var db;
var bcrypt = require('bcrypt');
const collections = require('../config/collections');
let promise = require('promise');
const {checkObjectId, get_email_id} = require('./common_helpers')

module.exports = {
    initDB: function (DB) {

        return new Promise((resolve, reject) => {
            db = DB.get();
            // console.log(db);
            resolve();
        })
    },

    varify: (req) => {
        user = req.session.user_data
        if (user) {
            return true
        }
        return false
    },

    doSignup: (userData) => {
        return new promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 12);
            userData.address1 = null;
            console.log(userData);
            if (await db.collection(collections.USER_COLLECTION).findOne({ email: userData.email })) {
                resolve({ status: false })
            }
            else {
                db.collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {

                    let cartObj = {
                        _id: data.insertedId,
                        cart: []
                    }
                    db.collection(collections.CART).insertOne(cartObj)
                    resolve({ status: true });
                    // console.log("success");
                })
            }
        })
    },

    signInWithGoogle: (userData) => {
        return new Promise(async (resolve, reject) => {
            db.collection(collections.USER_COLLECTION).findOne({ _id: userData._id }).then((res) => {
                if (res) {
                    resolve(res)
                }
                else {
                    db.collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {
                        let cartObj = {
                            _id: data.insertedId,
                            cart: []
                        }
                        db.collection(collections.CART).insertOne(cartObj)
                        resolve(userData);
                        // console.log("success");
                    })
                }
            })
        })
    },

    doLogin: (userData) => {
        return new promise((resolve, reject) => {
            let response = {};
            db.collection(collections.USER_COLLECTION).findOne({ email: userData.email }).then((user) => {
                if (!user)
                    return reject(response);
                bcrypt.compare(userData.password, user.password).then((flag) => {
                    if (flag) {
                        console.log('login success');
                        response.status = true;
                        response.details = user;
                        resolve(response);
                    }
                    else {
                        return reject(response);
                    }
                })
            }).catch((err) => {
                console.log("Login faild ! ");
                throw err;
            })
        })
    },

    totalPrice: (products) => {
        var totalPrice = 0;
        products.forEach(async element => {
            var price = parseInt(element.price)
            var count = parseInt(element.count)
            totalPrice += price * count;
        })
        return totalPrice;
    },

    addAddress: (address) => {
        return new promise((resolve, reject) => {
            db.collection(collections.USER_COLLECTION).updateOne(
                {
                    _id: checkObjectId(address.user_id)
                },
                {
                    $set: {
                        "address1": address
                    }
                }
            ).then((res) => {
                resolve(res.insertedId)
            }
            )
        })
    },
}
