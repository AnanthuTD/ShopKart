var express = require('express');
const { render } = require('../app');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

/* GET home page. */
router.get('/', function (req, res, next) {

  let user = req.session.user_data;
  productHelpers.getAllProducts().then((products) => {

    res.render('users/user-main', { title: 'shop kart', products: products, user: user });
  })

});

router.get('/login', function (req, res, next) {

  res.render('users/login', { title: 'shop kart' });

});

router.get('/signup', function (req, res, next) {

  res.render('users/signup', { title: 'shop kart' });

});

router.post('/user-signup', function (req, res) {

  userHelpers.doSignup(req.body).then((response) => {

    res.render('users/login')
  }).catch((err) => {
    throw err;
  })
})

router.post('/user-login', function (req, res) {

  userHelpers.doLogin(req.body).then((response) => {

    if (response.status) {
      var data = response
      req.session.logedIn = true;
      req.session.user_data = data;
      res.redirect('/')
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

router.get('/cartView/:userId', (req, res) => {

  var userId = req.params.userId;

  userHelpers.getAllProducts(userId).then((products) => {

    res.render('users/cart', { products })

  })

})

router.get('/cart/:userId/:proId', (req, res) => {

  var userId = req.params.userId;
  var proId = req.params.proId;
  console.log(userId);
  userHelpers.getProductInfo(userId, proId).then(() => {

    userHelpers.getAllProducts(userId).then((products) => {

      res.render('users/cart', { products })

    })
  })
})



module.exports = router;