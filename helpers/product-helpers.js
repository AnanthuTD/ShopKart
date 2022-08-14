// accessing db
var db = require('../config/connection')
// accessing collections
var collections = require('../config/collections');
const { resolve, reject } = require('promise');
const { ObjectId } = require('mongodb');
const { response } = require('express');

module.exports = {

    addProduct: (product, callback) => {

        db.get().collection(collections.PRODUCT_COLLECTION).insertOne(product).then((data) => {

            id = data.insertedId.toString();
            callback(id);
        }).catch((err) => { throw err })
    },

    addImage: async (productImage, id) => {

        var myquery = { _id: ObjectId(id) };
        var newvalues = { $set: { img: productImage } };

        db.get().collection(collections.PRODUCT_COLLECTION).updateOne(myquery, newvalues, function (err, res) {
            if (err) throw err;
            console.log(res);
        });
    },

    getAllProducts: () => {

        return new Promise(async function (resolve, reject) {

            let products = await db.get().collection(collections.PRODUCT_COLLECTION).find().toArray();
            resolve(products);
        });
    },

    deleteProduct: (proId)=>{

        proId = ObjectId(proId);
        console.log(proId);
        return new Promise((resolve, reject) => {
            db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({_id: proId}).then((res)=>{
                resolve({status: true});
            }).catch((err)=>{
                reject({status: false})
            })
        })
    },

   
}