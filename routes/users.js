"use strict";
var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const emailHelpers = require('../helpers/emailHelper')
const cartHelpers = require('../helpers/cart_helpers')
const order_helpers = require('../helpers/order_helpers')
const payment_helpers = require('../helpers/payment_helpers')
const common_helpers = require('../helpers/common_helpers');
let cart_count = 0

router.get('/', function (req, res, next) {
    req.session.loginAttempt = false;
    let user = req.session.user_data;
    console.error("hi");
    productHelpers.getAllProducts().then((products) => {
        console.log(products);
        if (user) {
            cartHelpers.cartCount(user.details._id).then((response) => {
                cart_count = response
                res.render('users/user-main', { title: 'shop kart', products: products, user: user, count: cart_count });
            })
        }
        else
            res.render('users/user-main', { title: 'shop kart', products, user, count: cart_count });
    }).catch(err => console.error('error while fetching products'))
});

router.get('/login', function (req, res) {
    let user = req.session.user_data;
    var message = ""
    if (req.session.loginAttempt) {
        message = "Invalid creditials! try signup :)"
    }
    res.render('users/login', { title: 'shop kart', user: user, 'message': message });
});

router.get('/signup', function (req, res, next) {
    res.render('users/signup', { title: 'shop kart' });
});

router.post('/user-signup', function (req, res) {
    userHelpers.doSignup(req.body).then((response) => {
        if (response.status)
            res.redirect('/login')
        else {
            var emailErr = "This email id already exist";
            res.render('users/signup', { title: 'shop kart', emailErr });
        }
    })
})

router.post('/user-login', function (req, res) {
    userHelpers.doLogin(req.body).then((response) => {
        if (response.status) {
            var data = response
            req.session.logedIn = true;
            req.session.user_data = data;
            if (!req.session.history) {
                res.redirect('/')
            }
            else {
                res.redirect(req.session.history)
            }
        }
    }).catch(() => {
        req.session.loginAttempt = true
        res.redirect('/login')
    })
})

router.get('/logout', (req, res) => {
    req.session.destroy()
    res.redirect('/')
})

router.get('/cart', (req, res) => {
    req.session.history = req.originalUrl;
    let user = req.session.user_data;
    if (user) {
        cartHelpers.getAllProducts(user.details._id).then((products) => {
            var itemCount = products.length;
            var totalPrice = userHelpers.totalPrice(products);
            res.render('users/cart', { products, user, cart: false, no_header: true, cartId: user.details._id, itemCount, totalPrice })
        }).catch((emptyCart) => {
            var itemCount = 0
            var totalPrice = 0
            res.render('users/cart', { products: emptyCart, user, cart: false, no_header: true, cartId: user.details._id, itemCount, totalPrice })
        })
    }
    else {
        res.redirect('/login')
    }
}
)

router.get('/add-to-cart/:proId', (req, res) => {
    let user = req.session.user_data;
    var proId = req.params.proId;
    productHelpers.addProduct(user.details._id, proId).then((status) => {
        res.json({ status: status.status })
    })
})

router.get('/remove-product/:proId', (req, res) => {
    let user = req.session.user_data;
    var proId = req.params.proId;
    productHelpers.removeProduct(proId, user.details._id, proId).then((stat) => {
        cartHelpers.getAllProducts(user.details._id).then((products) => {
            res.render('users/cart', { cart: true, layout: false, products, no_header: true })
        })
    })
})

router.get('/qty/:cartId/:proId', (req, res) => {
    var cartId = req.params.cartId;
    var proId = req.params.proId;
    cartHelpers.decCartCount(cartId, proId).then((response) => {
    })
    res.json({ status: true })
})

router.post("/checkout-address", (req, res) => {
    let user = req.session.user_data;
    userHelpers.addAddress(req.body).then(() => {
        req.session.user_data.details.address1 = true
        let user = req.session.user_data;
        res.render('users/checkout', { layout: false, no_header: true, user })
    })
})

router.get('/checkout', (req, res) => {
    let user = req.session.user_data;
    cartHelpers.getAllProducts(user.details._id).then((products) => {
        var total = userHelpers.totalPrice(products);
        res.render('users/checkout', { user, total, products })
    })

})

router.get('/place-order', async (req, res) => {
    let user = req.session.user_data;
    var userId = user.details._id
    console.log("\nplace order\n");
    var email_id = await common_helpers.get_email_id(userId)
    order_helpers.placeOrder(userId).then((response) => {
        if (response.status) {
            order_helpers.orderDetails(null, response.orderId).then((products) => {
                var i = 0;
                products.forEach(element => {
                    element.count = response.quantity[i++]
                });
                var total = userHelpers.totalPrice(products);
                payment_helpers.generateRazorpay(total, response.orderId).then((order) => {
                    res.json({ order, email_id })
                }).catch((err) => { console.error(err); })
            })
        }
        else {
            console.log("\n Faild to place order \n");
        }
    })
})
router.get('/orders', (req, res) => {
    let user = req.session.user_data;
    var userId = user.details._id
    order_helpers.orderDetails(userId, null).then((products) => {
        res.render('users/orders', { user, products })
    })
})

router.post('/varify_payment', (req, res) => {
    let user = req.session.user_data;
    var userId = user.details._id
    var orderDt = req.body;
    var orderId = orderDt['order[receipt]']
    console.log(orderId);
    payment_helpers.varifyPayment(orderDt).then(() => {
        // removing clearing cart
        cartHelpers.removeCart(userId);
        // changing order status to placed
        order_helpers.changOrderStatus(orderId)
        // retriving order details
        order_helpers.orderDetails(null, orderId).then((products) => {
            // generating invoice
            order_helpers.generateInvoice(orderId, products).then(async () => {
                // sending email
                var email_id = await  common_helpers.get_email_id(userId)
                emailHelpers.sendEmail(orderId, email_id)
            })
            req.session.products = products
            console.log(products);
            res.json({})
        })
    }).catch((err) => {
        console.error(err);
        res.json({ status: false })
    })
})

router.post('/search-products', (req, res) => {
    console.log("search");
    var search = req.body.search
    productHelpers.searchProducts(search).then((response) => {
        var proDt = [], i = 0;
        if (response != []) {
            response.forEach(element => {
                proDt[i++] = ({
                    name: element.name, index: element.index, id: element._id
                })
            });
        }
        res.render('users/search-products', { layout: false, search: proDt })
    })
})

router.post('/google-signup', async (req, res) => {
    const googleHelpers = require('../helpers/google-helpers')
    let token = req.body
    googleHelpers.verify(token).then((payload) => {
        var user = {
            '_id': payload.sub,
            'first_name': payload.given_name,
            'last_name': payload.family_name,
            'email': payload.email,
        }
        userHelpers.signInWithGoogle(user).then((data) => {
            var temp = { "details": data, 'status': true }
            req.session.logedIn = true;
            req.session.user_data = temp;
            res.redirect('/')
        })

    }).catch(err => console.error('sign in with google : ', err))

})

router.get('/product/:product_id', (req, res) => {
    var product_id = req.params.product_id
    let user = req.session.user_data;
    // console.log('product id = ', product_id);
    productHelpers.getProduct(product_id).then((product_details) => {
        console.log(product_details);
        res.render('users/product', { product_details, user })
    })
})

router.get('/buy-now/:product_id', (req, res) => {
    var product_id = req.params.product_id
    let user = req.session.user_data;
    var user_id = user.details._id
    productHelpers.buyNow(product_id, user_id).then((response) => {
        if (response.status) {
            userHelpers.orderDetails(null, response.orderId).then((products) => {
                var i = 0;
                products.forEach(element => {
                    element.count = response.quantity[i++] || 1
                })
                var total = userHelpers.totalPrice(products);
                userHelpers.generateRazorpay(total, response.orderId).then(async (order) => {
                    var email_id = await userHelpers.get_email_id(user_id)
                    res.json({ order, email_id })
                }).catch((err) => { console.error(err); })
            })
        }
        else {
            console.log("\n Faild to place order \n");
        }
    })
})

router.get('/order-status', (req, res) => {
    let user = req.session.user_data;
    var products = req.session.products
    res.render("users/order-status", { user, products })

})
module.exports = router;