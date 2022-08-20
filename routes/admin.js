var express = require('express');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('admin/dash-board', { title: 'shop kart', admin: true });
});
// GET user page
router.get('/admin/user', function (req, res, next) {
  res.render('index', { title: 'shop kart', admin: true });
});
// GET products page
router.get('/products', function (req, res, next) {

  productHelpers.getAllProducts().then((products) => {

    res.render('admin/products', { title: 'shop kart', admin: true, products: products });
  }).catch((err) => {

    throw (err);
  })

});
// GET add-products page
router.get('/add-products-page', function (req, res, next) {
  res.render('admin/add-products', { title: 'shop kart', admin: true });
});

router.post('/add-products', (req, res, next) => {
  // console.log(req.body)
  // console.log(req.files.image.name)
  var fileExt = path.extname(req.files.image.name)

  productHelpers.addProduct(req.body, (id) => {

    let img = req.files.image;
    let imgName = id + fileExt;
    console.log('uploading');

    productHelpers.addImage(imgName, id);

    img.mv("./public/products/" + imgName, (err, done) => {

      if (err) throw err;
      else console.log('success uploading file')
    });
    res.redirect('/admin/products');
  });
});

router.get('/deleteProduct/:proId', (req, res) => {
  var proId = req.params.proId;
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response) => {
    if (response.status) {
      res.redirect('back');
    }
  })
})

router.get('/edit-product/:proId', (req, res) => {

  var proId = req.params.proId;
  console.log(proId);
  productHelpers.getProduct(proId).then((response) => {

    console.log(response);
    res.render('admin/edit-product', { product: response })
  })
})


router.post('/edit-product/:id', (req, res) => {

  var id = req.params.id;
  var fileExt = path.extname(req.files.image.name);
  console.log(req.body, id)

  productHelpers.editProduct(req.body, id).then((stat)=>{

    let img = req.files.image;
    let imgName = id + fileExt;
    console.log('\nuploading\n');

    productHelpers.addImage(imgName, id);

    img.mv("./public/products/" + imgName, (err, done) => {

      if (err) throw err;
      else console.log('success uploading file')
    });
  })
  res.redirect('/admin/products')

});

module.exports = router;
