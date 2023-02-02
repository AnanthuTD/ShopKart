'use strict'
const collections = require('../config/collections');
let promise = require('promise');
const { ObjectId } = require('mongodb');
const db = require('../config/connection');
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
    checkObjectId:(id) => {
        var objId
        try {
            objId = ObjectId(id)
        }
        catch (error) {
            objId = id
        }
        return (objId)
    },

    get_email_id: async (userId) => {
        var result = await db.get().collection(collections.USER_COLLECTION).findOne({ '_id': checkObjectId(userId) }, { _id: 0 })
        var email = result.email;
        return email
    }
}