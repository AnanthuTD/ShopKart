const collections = require('../config/collections');
let promise = require('promise');

module.exports.createIndex = (db) => {
    createIndex(db);
}
function createIndex(db) {
    return new promise((resolve, reject) => {

        db.get().collection(collections.PRODUCT_COLLECTION).dropIndex("productIndex").catch(err => {
            if (err.codeName == 'NamespaceNotFound') {
                db.createCollection(collections.PRODUCT_COLLECTION).catch(err => {
                    console.log("FAILD TO CREATE " + collections.PRODUCT_COLLECTION);
                }).then((res) => {
                    console.log(res);
                })
            }
        }).then(() => {
            db.get().collection(collections.PRODUCT_COLLECTION).createIndex(
                {
                    name: "text",
                    index: "text",

                },
                {
                    weights: {
                        index: 2,
                    },
                    name: "productIndex"
                }
            ).catch((err) => {
                resolve()
            })
            resolve()
        })
    })
}
