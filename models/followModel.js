const { LIMIT } = require("../privateConstants");
const followSchema = require("../Schemas/followSchema");
const userSchema = require("../Schemas/userSchema");

const Follow = class {
    constructor({followerUserID,followingUserID}){
        this.followerUserID = followerUserID;
        this.followingUserID = followingUserID;
    }
    followUser(){
        return new Promise(async(res, rej) => {
            try {
                console.log("Checking if already following...");
                const isAlreadyFollowing = await followSchema.findOne({
                    followerUserID: this.followerUserID,
                    followingUserID: this.followingUserID,
                });
    
                console.log("isAlreadyFollowing", isAlreadyFollowing);
    
                if (isAlreadyFollowing) {
                    console.log("Already following! Rejecting...");
                    return rej("You are already following this user!");
                }
    
                console.log("Creating new followSchema object...");
                const followObj = new followSchema({
                    followerUserID: this.followerUserID,
                    followingUserID: this.followingUserID,
                });
    
                console.log("Updating follower count...");
                await userSchema.findOneAndUpdate(
                    { _id: this.followerUserID },
                    { $inc: { followingCount: 1 } }
                );
    
                console.log("Updating following count...");
                await userSchema.findOneAndUpdate(
                    { _id: this.followingUserID },
                    { $inc: { followerCount: 1 } }
                );
    
                console.log("Saving to followSchema...");
                const followDB = await followObj.save();
                console.log("Saved follow:", followDB);
                res(followDB);
            } catch (err) {
                console.log("followUser error", err);
                rej(err);
            }
        });
    }
    

    //to get the following list of user
      static getFollowingList ({followerUserID,SKIP}){
     return new Promise(async(res,rej)=>{

        try{
            const followingListDB = await followSchema.find({followerUserID:followerUserID}).populate("followingUserID").sort({creationDateTime:-1}).skip(SKIP).limit(LIMIT);
            if(!followingListDB || followingListDB === 0){

            rej("you are not following anyone yet!")
            }
            const followingUserID =  followingListDB.map((item)=>item.followingUserID);
       
            const followingUserDetails = await userSchema.find({_id:{$in:followingUserID}});
          
            console.log("followingUserDetails",followingUserDetails)

            // res(followingUserDetails.reverse());
            res(followingListDB);
        }
        catch(err){
            rej(err);
        }

     })
    }
    //to get the followers list
    static getFollowersList({followingUserID,SKIP}){
        return new Promise(async(res,rej)=>{
            try{
            const followerDB = await followSchema.aggregate([
                {$match:{followingUserID}},{$skip:SKIP},{$sort:{creationDateTime:-1}},{$limit:LIMIT}
            ])
            const followerUserID = followerDB.map((item)=>item.followerUserID);
            const followerUserDetails = await userSchema.find({ _id: { $in: followerUserID } });

            res(followerUserDetails);

    }
    catch(err){
         rej(err);
            }
        })
    }
    //to unfollow a user
    static unfollowUser({followerUserID,followingUserID}){
        return new Promise(async(res,rej)=>{
            try{
             const unfollowDB = await followSchema.findOneAndDelete({followerUserID,followingUserID});
             console.log('unfollowDB',unfollowDB);
             res(unfollowDB);
            }
            catch(err){
                rej(err);
            }
        })
    }
}
module.exports = Follow;