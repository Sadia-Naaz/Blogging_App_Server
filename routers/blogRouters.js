const express = require("express");
const { createBlogController, raedBlogController, readMyBlogController, editBlogController, deleteBlogController, restoreBlogController, trashedBlogsController,commentBlogController,likeBlogController,getBlogDetailsController, readCommentsController} = require("../controllers/blogControllers");
const AuthenticateSession = require("../middlewares/isAuth");
const upload = require("../middlewares/upload");
const BlogRouter = express.Router();

BlogRouter
  .post("/create-blog", AuthenticateSession, upload.single('image'), createBlogController)
  .get("/read-blogs", AuthenticateSession, raedBlogController)
  .get("/read-my-blogs", AuthenticateSession, readMyBlogController)
  .post("/comment", AuthenticateSession, commentBlogController)
  .post("/like", AuthenticateSession, likeBlogController)
  .post("/edit-blogs", AuthenticateSession, editBlogController)
  .post("/delete-blogs", AuthenticateSession, deleteBlogController)
  .post("/restore-blogs", AuthenticateSession, restoreBlogController)
  .get("/trash-blogs", AuthenticateSession, trashedBlogsController) // move this before
  .get("/:blogID", AuthenticateSession, getBlogDetailsController)
  .get("/readComments/:blogID",AuthenticateSession,readCommentsController) // wildcard at bottom

module.exports = BlogRouter;