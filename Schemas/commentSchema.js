const { text } = require('express');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const commentSchema = new Schema({
  
    userID:{
      type:Schema.Types.ObjectId,//  refernce to userModel,
      ref:"blogger"
    },
    blogID:{
     type:Schema.Types.ObjectId,
     ref:"blogModel" // reference to userBlog Model,
    },
    text:{
        type:String,
    },
    creationDateTime:{
        type:Date,
        default:Date.now
    }
    
    
});
module.exports = mongoose.model("comments",commentSchema);