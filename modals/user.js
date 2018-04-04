var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");
var userSchema = new mongoose.Schema({
    username: {type: String, required: true, unique: true},
    password: String,
    isAdmin: {type: Boolean, default: false},
    email: {type: String, required: true, unique: true},
    resetPasswordToken: String,
    resetPasswordExpire: Date
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("user",userSchema);