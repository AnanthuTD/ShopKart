'use strict'
let db;
const collections = require('../config/collections');
let promise = require('promise');
const { ObjectId } = require('mongodb');
const {checkObjectId, get_email_id} = require('./common_helpers')


module.exports = {
    initDB: function (DB) {

        return new Promise((resolve, reject) => {
            db = DB.get();
            // console.log(db);
            resolve();
        })
    },
    cartCount: async (userId) => {
        userId = await checkObjectId(userId)
        return new promise(async (resolve, reject) => {
            var count = await db.collection(collections.CART).
                aggregate([
                    {
                        $match:
                        {
                            _id: userId
                        }
                    },
                ]).toArray();
            if (count.length != 0)
                count = count[0].cart.length
            else
                count = 0

            resolve(count);
        })
    },

    decCartCount: (cartId, proId) => {
        cartId = checkObjectId(cartId)
        return new promise((resolve, reject) => {
            db.collection(collections.CART).
                updateOne(
                    {
                        _id: cartId, 'cart.proId': ObjectId(proId)
                    },
                    {
                        $inc:
                        {
                            'cart.$.quantity': -1
                        }
                    }
                ).then((res) => {
                    resolve({ status: true })
                }).catch((err) => {
                    console.error(err);
                })
        })
    },
    removeCart: (id) => {
        db.collection(collections.CART).deleteOne({ _id: checkObjectId(id) })
    },

    getAllProducts: async (userId) => {
        userId = await checkObjectId(userId)
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            var products = await db.collection(collections.CART).aggregate([

                {
                    $match: {
                        _id: userId
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
           
            if (products.length != 0) {
                products = products[0].products;
                var cart = await db.collection(collections.CART).aggregate([
                    {
                        $match: {
                            _id: userId
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

                for (var i = 0; i < length; i++) {
                    products[i].count = quantity[i];
                    products[i].id = "id" + products[i]._id
                }
                resolve(products);
            }
            else {
                reject(null)
            }
        })
    },
}