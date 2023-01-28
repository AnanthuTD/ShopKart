var dotenv = require("dotenv");
var db = require ('../config/CloudConnection')
test('connetion to mongodb atlas', () => { 
    dotenv.config()
    db.connect()
 })
