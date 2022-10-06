var addToCart = require('../public/javascripts/cart')
var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const { decCartCount } = require('../helpers/user-helpers');
const { response } = require('express');

/* GET home page. */
router.get('/', function (req, res, next) {

  req.session.history = req.originalUrl;
  let count = 0
  let user = req.session.user_data;
  productHelpers.getAllProducts().then((products) => {

    console.log(user);
    if (user) {
      userHelpers.cartCount(user.details._id).then((response) => {
        
        console.log(count);
        count = response
      
        // res.render('users/user-main', { title: 'shop kart', products: products, user: user, count });
      })
    }

    console.log(count);
    res.render('users/user-main', { title: 'shop kart', products: products, user: user, count: count });


  })

});

router.get('/login', function (req, res, next) {

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

      res.redirect(req.session.history)
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
  console.log(user);
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
  console.log(proId);
  userHelpers.decCartCount(cartId, proId).then((response) => {

    console.log("done");
  })
  console.log("out");
  res.json({ status: true })
})

router.post("/checkout-address", (req, res) => {
  console.log(req.body)
  userHelpers.addAddress(req.body).then(() => {

  })
})

router.get('/checkout', (req, res) => {
  let user = req.session.user_data;
  res.render('users/checkout', { user })
})

// router.get('/place-order', (req, res) => {
//   userHelpers.cartProductList(user.details._id).then(() => {
//     let user = req.session.user_data;
//     console.log("out");
//     res.render('users/order-status', { user })
//   })

// })
router.get('/place-order', (req, res) => {
  let user = req.session.user_data;
  console.log("\nplace order\n");
  userHelpers.placeOrder(user.details._id).then(() => {
    console.log("\n order placed\n");
  })

  res.render('users/order-status', { user })

})
module.exports = router;