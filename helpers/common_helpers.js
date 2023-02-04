'use strict'
const collections = require('../config/collections');
let promise = require('promise');
const { ObjectId } = require('mongodb');
let db
function checkObjectId(id) {
    var objId
    try {
        objId = ObjectId(id)
    }
    catch (error) {
        objId = id
    }
    return (objId)
}
module.exports = {
    initDB: function (DB) {
        return new Promise((resolve, reject) => {
            db = DB.get();
            // console.log(db);
            resolve();
        })
    },

    'checkObjectId': checkObjectId,

    get_email_id: async (userId) => {
        var result = await db.collection(collections.USER_COLLECTION).findOne({ '_id': checkObjectId(userId) }, { _id: 0 })
        var email = result.email;
        return email
    }
}