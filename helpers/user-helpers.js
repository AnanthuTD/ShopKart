
const db = require('../config/connection');
const { Db, ObjectId } = require('mongodb');
var bcrypt = require('bcrypt');
const collections = require('../config/collections');
const { resolve, reject } = require('promise');
var Razorpay = require('razorpay');
const { search } = require('../routes/users');
const { query } = require('express');
var instance = new Razorpay({
    key_id: 'rzp_test_qjRHUAXRk6sVu8',
    key_secret: 'g17l3MkiyWLa38e4IyHLTbPt'
})
let RazorpayOrderId = ''

module.exports = {

    varify: (req) => {
        user = req.session.user_data
        if (user) {
            return true
        }
        return false
    },

    doSignup: (userData) => {


        return new Promise(async (resolve, reject) => {

            userData.password = await bcrypt.hash(userData.password, 12);
            userData.address1 = null;

            if (await db.get().collection(collections.USER_COLLECTION).findOne({ email: userData.email })) {
                resolve({ status: false })
            }
            else {
                db.get().collection(collections.USER_COLLECTION).insertOne(userData).then((data) => {

                    let cartObj = {
                        _id: data.insertedId,
                        cart: []
                    }
                    db.get().collection(collections.CART).insertOne(cartObj)
                    resolve({ status: true });
                    // console.log("success");
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
                    },
                    {
                        upsert: true
                    }
                ).then((res) => {

                    console.log('\n Product Successfully added to cart \n');
                    resolve({ status: true });

                }).catch((err) => {

                    if (err.name == 'MongoServerError' && err.code === 11000) {
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
                            )
                            .catch((err) => {
                                console.log('increment failed' + err);
                            })

                        resolve({ status: true });
                    }
                    else {
                        throw new Error(err);
                    }

                })

        });

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

            if (products.length != 0) {

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
                resolve(products);
            }
            else {
                reject(null)
            }
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
            if (count.length != 0)
                count = count[0].cart.length
            else
                count = 0

            resolve(count);
        })
    },

    decCartCount: (cartId, proId) => {

        return new Promise((resolve, reject) => {

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
                ).then((res) => {
                    resolve({ status: true })
                }).catch((err) => {
                    console.log(err);
                })
        })

    },

    totalPrice: (products) => {


        var totalPrice = 0;
        products.forEach(async element => {
            price = parseInt(element.price)
            count = parseInt(element.count)
            totalPrice += price * count;
        })

        return totalPrice;
    },

    placeOrder: (user_id) => {
        return new Promise(async (resolve, reject) => {

            var order = await db.get().collection(collections.CART).aggregate([
                {
                    $match: {
                        _id: ObjectId(user_id)
                    }
                },
                {
                    $project: {
                        proId: {
                            $map: {
                                input: '$cart',
                                as: 'proId',
                                in: '$$proId'
                            },
                        },
                    }
                },
                {
                    $lookup: {
                        from: collections.USER_COLLECTION,
                        foreignField: "_id",
                        localField: "_id",
                        as: "address"
                    }
                },
                {
                    $project: {
                        "address.address1": 1,
                        _id: 0,
                        proId: 1,

                    }
                },
                {
                    $unwind:
                        "$address"

                },
                { $addFields: { userId: ObjectId(user_id), "Order_date": "$$NOW", 'status': 'pending' } },

            ]).toArray();

            var i = 0
            var quantity = [0]
            order = order[0]
            order.proId.forEach(element => {
                quantity[i++] = element.quantity
            });

            var orderId = ''
            await db.get().collection(collections.ORDER).insertOne(order).catch((err) => {
                console.error(err);
            }).then((res) => {
                console.log(res);
                orderId = (res.insertedId)
            })

            if (order) {
                var response = {
                    status: true,
                    orderId: orderId,
                    quantity: quantity
                }
                resolve(response)
            }
            else
                reject({ status: false })
        })
    },

    orderDetails: (user_id = null, orderId = []) => {

        return new Promise(async (resolve, reject) => {

            var products = await db.get().collection(collections.ORDER).aggregate([
                {
                    $match: {
                        $or: [
                            { "userId": ObjectId(user_id) },
                            { _id: orderId }
                        ]


                    }
                },
                {
                    $project: {
                        proId: {
                            $map: {
                                input: '$proId',
                                as: 'proDetails',
                                in: '$$proDetails.proId'
                            },
                        },

                        _id: 0
                    }
                },

                {
                    $lookup:
                    {
                        from: collections.PRODUCT_COLLECTION,
                        localField: "proId",
                        foreignField: "_id",
                        as: 'products' // array containing the details of products
                    }
                },
                {
                    $project: {
                        "proId": 0
                    }
                },

            ]).toArray()
            console.log(products[0]);
            var productsArray = [], i = 0
            products.forEach(element => {
                productsArray[i++] = element.products[0]
            });
            console.log(productsArray);
            resolve(productsArray)
        })

    },

    addAddress: (address) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.USER_COLLECTION).updateOne(
                {
                    _id: ObjectId(address.user_id)
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

    removeCart: (id) => {
        db.get().collection(collections.CART).deleteOne({ _id: ObjectId(id) })

    },

    generateRazorpay: async (amount, orderId) => {

        amount = parseInt(amount * 100)
        orderId = orderId.toString()

        try {
            return await new Promise((resolve, reject) => {
                instance.orders.create({
                    amount: parseInt(amount),
                    currency: "INR",
                    receipt: orderId
                },
                    function (err, order) {
                        if (err) {
                            console.error(err);
                            reject()
                        }

                        else {
                            RazorpayOrderId = order.id
                            resolve(order)
                        }
                    });
            });
        } catch (err) {
            console.error(err);
        }
    },

    varifyPayment: async (orderDt) => {
        return new Promise(async (resolve, reject) => {
            const {
                createHmac
            } = await import('node:crypto');

            let hmac = createHmac('sha256', 'g17l3MkiyWLa38e4IyHLTbPt');
            hmac.update(RazorpayOrderId + '|' + orderDt['order_dt[razorpay_payment_id]'])
            hmac = hmac.digest('hex')
            if (hmac == orderDt['order_dt[razorpay_signature]']) {
                resolve()
            } else {
                reject("payment varification faild")
            }
        })

    },
    changOrderStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.ORDER)
                .updateOne(
                    {
                        _id: ObjectId(orderId)
                    },
                    {
                        $set: {
                            'status': 'placed'
                        }
                    }
                ).then(() => {
                    resolve();
                }).catch((err) => {
                    reject()
                })
        })
    },

    searchProducts: (search) => {
        return new Promise(async (resolve, reject) => {
            console.log(search);
            var query = { $text: { $search: search } };

            var result = await db.get().collection(collections.PRODUCT_COLLECTION).find(query).toArray();

            resolve(result)
        })
    }
}
