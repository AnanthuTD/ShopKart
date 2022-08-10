var express = require('express');
var router = express.Router();
const productHelpers = require('../helpers/product-helpers');

/* GET home page. */
router.get('/', function(req, res, next) {

  productHelpers.getAllProducts().then((products)=>{

    res.render('users/user-main', { title: 'shop kart', products: products});
  })
  
});

module.exports = router;