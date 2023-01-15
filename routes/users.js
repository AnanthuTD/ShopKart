var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

router.get('/', function (req, res, next) {
    let count = 0
    console.log(req.session);
    let user = req.session.user_data;
    productHelpers.getAllProducts().then((products) => {
        if (user) {
            userHelpers.cartCount(user.details._id).then((response) => {
                count = response
                res.render('users/user-main', { title: 'shop kart', products: products, user: user, count });
            })
        }
        else
            res.render('users/user-main', { title: 'shop kart', products, user, count });
    })
});

router.get('/login', function (req, res) {
    let user = req.session.user_data;
    res.render('users/login', { title: 'shop kart', user: user });
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
                console.log(req.session.history);
                res.redirect(req.session.history)
            }
        }
        else
            res.redirect('/login')
    }).catch((err) => {
        throw (err);
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
        userHelpers.getAllProducts(user.details._id).then((products) => {
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
    userHelpers.addProduct(user.details._id, proId).then((status) => {
        res.json({ status: status.status })
    })
})

router.get('/remove-product/:proId', (req, res) => {
    let user = req.session.user_data;
    var proId = req.params.proId;
    userHelpers.removeProduct(proId, user.details._id, proId).then((stat) => {
        userHelpers.getAllProducts(user.details._id).then((products) => {
            res.render('users/cart', { cart: true, layout: false, products, no_header: true })
        })
    })
})

router.get('/qty/:cartId/:proId', (req, res) => {
    var cartId = req.params.cartId;
    var proId = req.params.proId;
    userHelpers.decCartCount(cartId, proId).then((response) => {
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
    userHelpers.getAllProducts(user.details._id).then((products) => {
        var total = userHelpers.totalPrice(products);
        res.render('users/checkout', { user, total, products })
    })

})

router.get('/place-order', (req, res) => {
    let user = req.session.user_data;
    var userId = user.details._id
    console.log("\nplace order\n");
    userHelpers.placeOrder(userId).then((response) => {
        if (response.status) {
            userHelpers.orderDetails(null, response.orderId).then((products) => {
                var i = 0;
                products.forEach(element => {
                    element.count = response.quantity[i++]
                });
                var total = userHelpers.totalPrice(products);
                userHelpers.generateRazorpay(total, response.orderId).then((response) => {
                    res.json(response)
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
    userHelpers.orderDetails(userId, null).then((products) => {
        res.render('users/orders', { user, products })
    })
})

router.post('/varify_payment', (req, res) => {
    let user = req.session.user_data;
    var userId = user.details._id
    var orderDt = req.body;
    var orderId = orderDt['order[receipt]']
    userHelpers.varifyPayment(orderDt).then(() => {
        userHelpers.removeCart(userId);
        userHelpers.changOrderStatus(orderId)
        console.log("payment success");
        userHelpers.orderDetails(null, orderId).then((products) => {
            res.render("users/order-status", { user, products })
        })

    }).catch((err) => {
        console.error(err);
        res.json({ status: false })
    })
})

router.post('/search-products', (req, res) => {
    console.log("search");
    var search = req.body.search
    userHelpers.searchProducts(search).then((response) => {
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

module.exports = router;