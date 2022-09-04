
const db = require('../config/connection');
const { Db, ObjectId } = require('mongodb');
var bcrypt = require('bcrypt');
const collections = require('../config/collections');
const { resolve, reject } = require('promise');
const { response } = require('express');

module.exports = {

    doSignup: (userData) => {


        return new Promise(async (resolve, reject) => {

            userData.password = await bcrypt.hash(userData.password, 12);

            if (await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email })) {

                resolve({ status: false })
            }
            else {
                db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {

                    console.log(data.insertedId.toString());
                    let cartObj = {
                        _id: data.insertedId,
                        cart: []
                    }
                    db.get().collection(collections.CART).insertOne(cartObj)
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

                db.get().collection(collections.CART)
                    .updateOne(
                        {
                            _id: ObjectId(userId),
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
                        }
                    ).then((res) => {

                        console.log(res);

                        if (res.modifiedCount == 0) {
                            console.log("\n Item already exist in the cart \n");
                            db.get().collection(collections.CART)
                                .updateOne(
                                    {
                                        _id: ObjectId(userId), 'cart.proId': ObjectId(proId)
                                    },
                                    {
                                        $inc:
                                        {
                                            'cart.$.quantity': 1
                                        }
                                    }
                                ).then((response) => {
                                    console.log('response');
                                    console.log(response);
                                }
                                ).catch((err) => {
                                    console.log('inc failed' + err);
                                })

                            resolve({ status: false });
                        }
                        else {
                            console.log('\n Product Successfully added to cart \n');
                            resolve({ status: true });
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

        return new Promise(async (resolve, reject) => {

            var products = await db.get().collection(collections.CART).aggregate([

                {
                    $match: {
                        _id: ObjectId(userId)
                    }
                },
                {
                    $project:
                    {
                        products: {
                            $map: {
                                input: '$cart',
                                as: 'cartItems',
                                in: '$$cartItems.proId'
                            },
                        },
                        _id: 0
                    }
                    // gives id products in cart as 'products'(array)
                },

                // for fetching the product details
                {
                    $lookup:
                    {
                        from: collections.PRODUCT_COLLECTION,
                        let: { proList: '$products' },   // assingn array of product ids in cart to proList
                        pipeline:
                            [
                                {
                                    $match: {
                                        $expr: {
                                            $in: ['$_id', '$$proList'] // compare id of products in PRODUCT_COLLECTION to that of cart
                                        }
                                    }
                                }
                            ],
                        as: 'products' // array containing the details of products
                    }
                }
            ]).toArray()

            products = products[0].products;

            var cart = await db.get().collection(collections.CART).aggregate([

                {
                    $match: {
                        _id: ObjectId(userId)
                    }
                },
                {
                    $project:
                    {
                        count: {
                            $map: {
                                input: '$cart',
                                as: 'itemCount',
                                in: '$$itemCount.quantity'
                            },
                        },
                        _id: 0
                    }

                },
            ]).toArray();
            var quantity = cart[0].count;
            var length = quantity.length;
            for (i = 0; i < length; i++) {
                products[i].count = quantity[i];
                products[i].id = "id" + products[i]._id
            }
            console.log(products);
            resolve(products);
        })



    },

    removeProduct: (proId, userId) => {

        return new Promise((resolve, reject) => {

            db.get().collection(collections.CART)
                .updateOne(
                    {
                        "_id": ObjectId(userId)
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

    cartCount: (userId) => {

        return new Promise(async (resolve, reject) => {

            var count = await db.get().collection(collections.CART).
                aggregate([
                    {
                        $match:
                        {
                            _id: ObjectId(userId)
                        }
                    },
                ]).toArray();

            var count = count[0].cart.length
            resolve(count);
        })
    },

    decCartCount: (cartId, proId) => {

        console.log(cartId);
        return new Promise((resolve, reject)=>{

            db.get().collection(collections.CART).
            updateOne(
                {
                    _id: ObjectId(cartId), 'cart.proId': ObjectId(proId)
                },
                {
                    $inc:
                    {
                        'cart.$.quantity': -1
                    }
                }
            ).then((res)=>{
                console.log(res);
                resolve({status: true})
            }).catch((err)=>{
                console.log(err);
            })
        })
        
    }

}
