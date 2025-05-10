const mongoose = require("mongoose");
const Schema = mongoose.Schema
const followSchema  = new Schema({
    followerUserID:{
    type:Schema.Types.ObjectId,//this will genrate automatically a unique Object ID for every follower;
    required:true,
    ref:"blog"
    },
    followingUserID:{
    type:Schema.Types.ObjectId,
    required:true,
    ref:"blog"
    },
    creationDateTime:{
     type:Date,
     default:Date.now,
     required:true,
    }
})
module.exports = mongoose.model("follow",followSchema);