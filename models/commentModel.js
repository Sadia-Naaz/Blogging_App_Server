const { LIMIT } = require("../privateConstants");
const commentSchema = require("../Schemas/commentSchema");
const CommentMongooseModel = require("../Schemas/commentSchema");
const mongoose = require('mongoose');

console.log(typeof("CommentMongooseModel",CommentMongooseModel))
const commentService = class{
    constructor({userID,blogID,text}){
       this.userID=userID;
       this.blogID=blogID;
       this.text=text;
    }
    createComment(){
        return new Promise(async(res,rej)=>{
        
            const commentsObj = new CommentMongooseModel({
                userID:this.userID,
                blogID:this.blogID,
                text:this.text,
                //mongoose will automatically add date 
            });
            try{
                const blogComments = await commentsObj.save();
                res(blogComments);
            }
            catch(err){
                rej(err.toString());
            }
        })
    }
    static readComment({blogID,skip}){
        return new Promise(async(res,rej)=>{
        try{
        const commentsDB = await CommentMongooseModel.aggregate([{$match:{ blogID: new mongoose.Types.ObjectId(blogID) }},{$sort:{creationDateTime:-1}},{$skip:skip},{$limit:LIMIT}])
        if(!commentsDB || commentsDB.length===0) rej("no comments are found regarding this post");
        res(commentsDB);
       }
       catch(error){
        console.log('error',error);
        rej(error);
       }
        })
    }
};
module.exports = commentService;