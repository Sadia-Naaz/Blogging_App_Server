const {getUserInfoModel,deleteUserModel}  = require("../models/userInfoModel");


const getUserInfo = async(req,res)=>{

    // console.log('Session in getUserInfo:', req.session);
    // if(!req.session.user){
    // return res.status(400).json({
    //   status:400,
    //   message:"no session is found regarding thses credentials"
    // })
    // }
const userID = req.session.user.userID;
console.log('userID',userID);

try{
     const userDB = await getUserInfoModel({userID});
     console.log("userDB",userDB);
     res.send({
        status:200,
        UserInfo:userDB,
        message: 'User info', session: req.session
     })
}
catch(err){
    console.log(err);
    res.send({
        status:500,
        message:"could not fetch user info"
    })
}




};
const deleteUserController=async(req,res)=>{
    const userID = req.session.user.userID;
try{
    const deleteDB = await deleteUserModel({userID});
    // console.log(deleteDB);
}
catch(Err){
    console.log(Err);
    res.send({
        status:500,
        message:"could not delete user info"
    })
}
}
module.exports = {getUserInfo,deleteUserController};