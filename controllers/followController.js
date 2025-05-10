const Follow = require("../models/followModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const followSchema = require("../Schemas/followSchema");
const { response } = require("express");


const followUserController = async (req, res) => {
    const followerUserID = req.session.user.userID;
    const { followingUserId } = req.body;
  
    console.log("followerUserID", followerUserID);
    console.log("followingUserID:", followingUserId);
  
    if (!mongoose.Types.ObjectId.isValid(followerUserID) || !mongoose.Types.ObjectId.isValid(followingUserId)) {
      return res.status(400).send({ message: "Invalid followerID or followingID." });
    }
  
    if (followerUserID.toString() === followingUserId.toString()) {
    return res.status(400).send({message:"you can't follow yourself"});
   
    }
  
    try {
      console.log("Calling findUserWithKey for follower...");
      const follower = await User.findUserWithKey({ key: followerUserID });
      console.log("Follower found:", follower);
    } catch (err) {
      console.log("Error finding follower:", err.message);
      return res.status(409).send({ message: err.message });
    }
  
    try {
      console.log("Calling findUserWithKey for following...");
      const following = await User.findUserWithKey({ key: followingUserId});
      console.log("Following user found:", following);
    } catch (err) {
      console.log("Error finding following user:", err.message);
      return res.status(409).send({ message: err.message });
    }
  
    console.log("Making follow object...");
    const followObj = new Follow({
      followerUserID: new mongoose.Types.ObjectId(followerUserID),
      followingUserID: new mongoose.Types.ObjectId(followingUserId),
    });
  
    try {
      console.log("Calling followUser method...");
      const followDB = await followObj.followUser();
      console.log("followDB:", followDB);
      return res.send({ status: 200, message: "successfully added a follower", data: followDB });
    } catch (err) {
      console.log("Error saving follow:", err.message);
      return res.status(500).send({ message: "internal db error", error: err.message });
    }
  };
  
// to get the following list----->>>>>>>>>>>>>>>>>>>>>>>>>
const getFollowingListController=async(req,res)=>{
    //suppose i am a user who have been logged in.now i want the list of users i follow.so who am i? follower
    const followerUserID = req.session.user.userID;
    const SKIP = Number(req.query.skip) || 0 ;
    console.log("skip",SKIP)
    try{
        const followingListDB = await Follow.getFollowingList({followerUserID,SKIP});
        console.log(followingListDB);
        return res.send({
            status:200,
            message:"successfully got the data",
            data:followingListDB
        })
    }
    catch(err){
        return res.send({
            status:404,
            message:"following list not found",
            error:err.toString(),
        })
    }

}
//getting followers list
const getFollowersListController = async(req,res)=>{
    const followingUserID = req.session.user.userID;
    const SKIP = Number(req.query.skip) || 0;
    console.log("skip",SKIP)
    try{
       await User.findUserWithKey({key:followingUserID});
    }catch(Err){
        return res.send({
            status:400,
            message:"invalid userID",
        })
    }
    try{
        const followersList = await Follow.getFollowersList({followingUserID,SKIP})
        console.log(followersList);
        if(followersList.length===0){
            return res.send({
                status:203,
                message:"no followers found",
            })
        }
        return res.send({
            status:200,
            message:"successfully got the data",
            data:followingListDB
        })  
    }
    catch(err){
        console.log(err);
        return res.send({
            status:500,
            message:"internal db error",
        })
    }
}
//unfollow a user 
const unfollowController = async(req,res)=>{
    const followerUserID = req.session.user.userID;
    const {unfollowUserID} = req.body;
    try{
        const unfollowUser = await Follow.unfollowUser({followerUserID,unfollowUserID});
        console.log("unfollowUser",unfollowUser);
        return res.send({
            status:200,
            message:"successfully unfollowed the user"
        })
    }
    catch(err){
        console.log(err);
        return res.send({
            status:500,
            message:"internal db error",
        })
    }
    
}

module.exports = {followUserController,getFollowingListController,unfollowController,getFollowersListController};