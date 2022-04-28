const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
    user_address : String,
    metausername: {type: String, default: ''},
    username : {type : String, default:''},
    email : {type : String, default:''},
    referredby: {type : String, default:''},
    password: {type : String, default:''},
    user_token : {type : String, default:''},
    user_bio : {type : String, default:''},
    user_balance : String
}, {timestamps: true})

module.exports = mongoose.model('user', UserSchema)