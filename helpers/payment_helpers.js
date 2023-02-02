'use strict'
let promise = require('promise');
var Razorpay = require('razorpay');
var instance = new Razorpay({
    key_id: 'rzp_test_qjRHUAXRk6sVu8',
    key_secret: 'g17l3MkiyWLa38e4IyHLTbPt'
})
let RazorpayOrderId = ''
const {checkObjectId, get_email_id} = require('./common_helpers')
const db = require('../config/connection');

module.exports =
{
    generateRazorpay: async (amount, orderId) => {
        amount = parseInt(amount * 100)
        orderId = orderId.toString()
        return await new promise((resolve, reject) => {
            instance.orders.create({
                amount: parseInt(amount),
                currency: "INR",
                receipt: orderId
            },
                function (err, order) {
                    if (err) {
                        console.error('error generateRazorpay', err);
                        reject()
                    }
                    else {
                        RazorpayOrderId = order.id
                        resolve(order)
                    }
                });
        });
    },

    varifyPayment: async (orderDt) => {
        return new promise(async (resolve, reject) => {
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
}