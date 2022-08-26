var addToCart = require('../public/javascripts/cart')
var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');

/* GET home page. */
router.get('/', function (req, res, next) {

  let count = 0
  let user = req.session.user_data;
  productHelpers.getAllProducts().then((products) => {

    console.log(user);
    if(user){
      userHelpers.cartCount(user.details._id).then((response)=>{

       count = response
       res.render('users/user-main', { title: 'shop kart', products: products, user: user , count});
      })
    }
    else{

      res.render('users/user-main', { title: 'shop kart', products: products, user: user , count});
    }
    
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
    else
    {
      var emailErr = "This email id already exist" ;
      res.render('users/signup', { title: 'shop kart', emailErr});
    }
    
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

router.get('/cart', (req, res) => {

  let user = req.session.user_data;
  userHelpers.getAllProducts(user.details._id).then((products) => {

    console.log(products);
    res.render('users/cart', { products, user ,cart:false})

  })

})

router.get('/add-to-cart/:proId', (req, res) => {

  let user = req.session.user_data;
  var proId = req.params.proId;
  console.log(user);
  userHelpers.addProduct(user.details._id, proId).then((status) => {

    res.json({status:status.status})
  })
})

router.get('/remove-product/:proId', (req, res) => {

  let user = req.session.user_data;
  var proId = req.params.proId;

  userHelpers.removeProduct(proId, user.details._id, proId).then((stat) => {

    userHelpers.getAllProducts(user.details._id).then((products) => {

      res.render('users/cart',{cart:true, layout:false, products})
  
    })
   
  })
})

module.exports = router;