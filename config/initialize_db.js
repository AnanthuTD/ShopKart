'use strict'
const cart_helpers = require("../helpers/cart_helpers");
const common_helpers = require("../helpers/common_helpers");
const order_helpers = require("../helpers/order_helpers");
const productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");

module.exports.Initialize = (DB)=> {
    // console.warn('initializing helpers', DB, "\n");
    productHelpers.initDB(DB).catch(err => console.error(err))
    userHelpers.initDB(DB).catch(err => console.error(err))
    cart_helpers.initDB(DB)
    common_helpers.initDB(DB)
    order_helpers.initDB(DB)
    
}
