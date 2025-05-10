const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const userSchema = new Schema({
    name:{
    type:String,
    required:true,
    },
    email:{
        type:String,    
        required:true,
        unique:true,
    },
    username:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        select:true,
    },
    isEmailVerified:{
        type:Boolean,
        default:false,
    },
    followerCount:{
        type:Number,
        default:0,
    },
    followingCount:{
        type:Number,
        default:0,
    },

})
module.exports = mongoose.model("blogger",userSchema);