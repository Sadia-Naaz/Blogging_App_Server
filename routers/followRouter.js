const express = require("express");
const { followUserController,getFollowingListController, unfollowController, getFollowersListController } = require("../controllers/followController");
const FollowRouter = express.Router();
FollowRouter
.post("/follow-user",followUserController)
.get("/following-list",getFollowingListController)
.get("/follower-list",getFollowersListController)
.post("/unfollow-user",unfollowController);

module.exports = FollowRouter;
