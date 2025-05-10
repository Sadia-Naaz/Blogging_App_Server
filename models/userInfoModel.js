const userSchema = require("../Schemas/userSchema")
const userBlogSchema = require("../Schemas/userBlogSchema");
const getUserInfoModel = ({userID})=>{
    return new Promise (async(res,rej)=>{
   
        try
        {
            const userDB  = await userSchema.findOne({_id:userID});
            res(userDB);
   
        }
        catch(err){
            rej(err);
        }
    })
}

const deleteUserModel = ({userID})=>{
    return new Promise(async(resolve,reject)=>{
        ///handle edge case user does't exist
        try{
            //first find user and delete
           const deleteDB = await userSchema.findOneAndDelete({_id:userID});
            //find all the blogs of the user and delete.
           await userBlogSchema.deleteMany({userID:userID});
           resolve(deleteDB);
        }
        catch(err){
        reject(err);
        }
    })
}
module.exports ={getUserInfoModel,deleteUserModel};