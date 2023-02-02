'use strict'
const collections = require('../config/collections');
let promise = require('promise');
const { ObjectId } = require('mongodb');
const {checkObjectId, get_email_id} = require('./common_helpers')
const db = require('../config/connection');
const { randomInt } = require('node:crypto');

let orderedProducts = []

module.exports =
{
    placeOrder: (user_id) => {
        return new promise(async (resolve, reject) => {
            user_id = await checkObjectId(user_id)
            var order = await db.get().collection(collections.CART).aggregate([
                {
                    $match: {
                        _id: user_id
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
                        as: "userDt"
                    }
                },
                {
                    $project: {
                        "address": '$userDt.address1',
                        _id: 0,
                        proId: 1,
                    }
                },
                {
                    $unwind:
                        "$address"
                },
                {
                    $addFields: { 'userId': user_id, "Order_date": "$$NOW", 'status': 'pending', 'DeliveryDate': null }
                },
            ]).toArray();
            var i = 0, quantity = [0]
            order = order[0]
            // console.log(order);
            order.proId.forEach(element => {
                quantity[i++] = element.quantity
            });
            var orderId = ''
            await db.get().collection(collections.ORDER).insertOne(order).catch((err) => {
                console.error(err);
            }).then((res) => {
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

    orderDetails: (user_id = null, orderId = null) => {
        return new promise(async (resolve, reject) => {
            user_id = await checkObjectId(user_id)
            var products = await db.get().collection(collections.ORDER).aggregate([
                {
                    $match: {
                        $or: [
                            { "userId": user_id },
                            { _id: ObjectId(orderId) }
                        ]
                    }
                },
                {
                    $project: {
                        DeliveryDate: '$DeliveryDate',
                        proId: {
                            $map: {
                                input: '$proId',
                                as: 'proDetails',
                                in: '$$proDetails.proId'
                            },
                        },
                        quantity: {
                            $map: {
                                input: '$proId',
                                as: 'proDetails',
                                in: '$$proDetails.quantity'
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

            if (products) {
                var count = 0
                orderedProducts = products.flatMap((element) => {
                    var array = element.products.flatMap(product => {
                        var date = element.DeliveryDate ? (element.DeliveryDate).toDateString() : null
                        var trimedproduct = {
                            '_id': product._id.toString(),
                            'name': product.name,
                            'quantity': element.quantity[count++],
                            'price': product.price,
                            'img': product.img,
                            'DeliveryDate': date
                        }
                        return trimedproduct
                    })
                    return array
                })
            }
            resolve(orderedProducts)
        })
    },
    changOrderStatus: async (orderId) => {
        var incDate = randomInt(10)
        return new promise(async (resolve, reject) => {
            await db.get().collection(collections.ORDER).aggregate(
                [
                    {
                        $match:
                            { _id: ObjectId(orderId) }
                    },
                    {
                        $project:
                        {
                            DeliveryDate:
                            {
                                $dateAdd:
                                {
                                    startDate: "$Order_date",
                                    unit: "day",
                                    amount: incDate
                                }
                            },
                            status: 'placed'
                        }
                    },
                    {
                        $merge: { into: collections.ORDER, on: "_id" }
                    }
                ]
            ).toArray()
            resolve()
        })
    },

    searchOrders: (search) => {
        return new promise(async (resolve, reject) => {
            var results = orderedProducts.map(product => {
                product.name.match(search) ? product : null
            })
            console.log(results);
        })
    },

    generateInvoice: (orderId, products) => {
        return new Promise((resolve, reject) => {

            var modProducts = products.map((product) => {
                return ({
                    "quantity": product.quantity,
                    "description": product.name,
                    "price": product.price
                })
            })
            var easyinvoice = require('easyinvoice');
            var fs = require('fs');
            db.get().collection(collections.ORDER).findOne({ '_id': ObjectId(orderId) }, { projection: { 'userId': 0 } }).then((res) => {
                var address = res.address
                var data = {
                    "client": {
                        "company": address.name,
                        "address": address.addressLine1,
                        "zip": address.pincode,
                        "city": address.city,
                        "country": address.state
                    },
                    "sender": {
                        "company": "Sample Corp",
                        "address": "Sample Street 123",
                        "zip": "1234 AB",
                        "city": "Sampletown",
                        "country": "Samplecountry"
                    },
                    "images": {
                        logo: fs.readFileSync('./public/images/invoiceLogo.png', 'base64'),
                    },
                    "information": {
                        "number": res._id,
                        "date": res.Order_date,
                    },

                    "products": modProducts,
                    "bottomNotice": "Kindly pay your invoice within 15 days.",
                    "settings": {
                        "currency": "INR",
                    },

                };
                easyinvoice.createInvoice(data, function (result) {
                    fs.writeFileSync(`./Invoice/${orderId}.pdf`, result.pdf, 'base64');
                }).then(() => resolve())
            })

        })
    },
}