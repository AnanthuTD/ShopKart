var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('admin/dash-board', { title: 'shop kart',admin:true });
});
// GET user page
router.get('/admin/user', function(req, res, next) {
  res.render('index', { title: 'shop kart',admin:true });
});
// GET products page
router.get('/products', function(req, res, next) {
  res.render('admin/products', { title: 'shop kart',admin:true });
});
// GET add-products page
router.get('/add-products-page', function(req, res, next) {
  res.render('admin/add-products', { title: 'shop kart',admin:true });
});
router.post('/add-products', (req, res, next) => {
  console.log(req.body)
  console.log('hi')
});



module.exports = router;
