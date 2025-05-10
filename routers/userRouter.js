const express = require("express");
const { getUserInfo, deleteUserController } = require("../controllers/userController");
const { restoreBlogController } = require("../controllers/blogControllers");
const UserRouter = express.Router();

UserRouter.get("/user-info",getUserInfo)
.post("/delete-user",deleteUserController)
.post("/restore-blog",restoreBlogController)

module.exports = UserRouter;