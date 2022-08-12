const collection = require('../config/collections');
const db = require('../config/connection');
var promise = require('promise');
const { Db } = require('mongodb');
var bcrypt = require('bcrypt');
const { resolve, reject } = require('promise');
const { response } = require('../app');

module.exports = {

    doSignup: (userData) => {

        return new promise(async (resolve, reject) => {

            userData.password = await bcrypt.hash(userData.password, 12);

            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {

                resolve(data.insertedId);
            })

        })
    },

    doLogin: (userData) => {

        return new promise(async (resolve, reject) => {

            let response = {};


            var user = await db.get().collection(collection.USER_COLLECTION).findOne({ email: userData.email });

            if (user) {

                bcrypt.compare(userData.password, user.password).then((flag) => {

                    if (flag) {

                        console.log('login success');
                        response.status = true;
                        response.details = user;
                        
                        resolve(response);
                    }
                    else {

                        console.log('login faild');
                        response.status = false;
                        
                        resolve(response)
                    }

                }).catch((err) => {
                    throw err;
                })
            }
        }).catch((err) => {
            
            resolve({ status: false })
            throw err;
        })
    }
}
