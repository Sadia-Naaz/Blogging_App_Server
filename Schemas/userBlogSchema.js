const mongoose =require("mongoose");
const commentSchema = require("./commentSchema");
const Schema  = mongoose.Schema;
const blogSchema = new Schema({
    title:{
    type:String,
    required:true,
    unique:true,
    trim:true,
    minLength:3,
    maxLength:100, 


    },
    textBody:{
        type:String,
        required:true,
        trim:true,
    minLength:3,
    maxLength:1000, 
    },
    image: { type: String, required: false }, 
    creationDateTime:{
     type:String,
     required:true,
    },
    userID:{
    type:Schema.Types.ObjectId,
    required:true,
    ref : "blogger",
    },
    isDeleted:{
        type:Boolean,
        default:false,
    },
    deletetionDateTime:{
        type:String,
    },
    likes:{
    type:Number,
    default:0,
    },
    likedUsers:[{type:mongoose.Schema.Types.ObjectId,ref:"blogger"}],

})
module.exports = mongoose.model("blog",blogSchema);