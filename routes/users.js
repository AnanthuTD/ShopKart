var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

/* GET home page. */
router.get('/', function (req, res, next) {

  let user = req.session.user_data;
  console.log(req.session.user_data)
  productHelpers.getAllProducts().then((products) => {

    res.render('users/user-main', { title: 'shop kart', products: products, user });
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
      // console.log(req);
      res.redirect('/')
    }
    else
      res.redirect('/login')

  }).catch((err) => {
    throw (err);
  })
})

router.get('/logout', (req, res)=>{
  req.session.destroy()
  res.redirect('/')
})
module.exports = router;