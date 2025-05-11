const { text } = require("express");
const blogModel = require("../models/blogModel");
const validateBlogData = require("../utils/validateBlogData");
const { param } = require("../routers/blogRouters");
const commentModel = require("../models/commentModel");
const commentService = require("../models/commentModel");
const { ObjectId } = require("mongodb");
const createBlogController = async(req,res)=>{
 
    const{title,textBody} = req.body;
  console.log("title",title);
  console.log("textbody",textBody);
  console.log("file",req.file);
    //now extract the userID from session
    const userID = req.session.user.userID;
    //validate the blog data
    try{
 
     await validateBlogData({title,textBody});
 
    }
    catch(err){
         return res.send({
            status:400,
            message:"Invalid Data!",
            error:err.toString(),
         })
    }
 
    try{
        //save this data to data base now
    const image = req.file ? `/uploads/${req.file.filename}`:null;
    const blogObj = new blogModel({title , textBody , userID,image});
    const blogDB = await  blogObj.createBlogModel(); 
    console.log('blogDB',blogDB);
    return res.send({
        status:201,
        message:"blog created successfuly",
        blogDB,
    })
    }
    catch(err){
        res.send({
            status:500,
            message:"internal db error",
            error:err.toString(),
        })
    }
 
}
//reading all the blogs available on the app
const raedBlogController=async(req,res)=>{
    //now to read the blog we have to apply pagination here as the user is getting post of everyone
    // first we have to query the skip value from url
    let SKIP = Number(req.query.skip)||0; 
    const userID = req.session.user.userID;
     console.log("skip",SKIP);
        try
        {
        const blogDB = await blogModel.readBlogModel({SKIP,userID});
        console.log('blogDB',blogDB);
        if(blogDB.length === 0){
            return res.send({
                status:500,
                message:"no data found",
            })
        }
        return res.send({
            status:200,
            message:"get all the data successfully",
            data:blogDB,
        })
    }
    catch(err){
        return res.send({
            status:500,
            message:"db error",
            error:err.toString(),
        })
    }
}
//reading only user's own blogs
 
const readMyBlogController = async(req,res)=>{
    console.log("entered into readmyBlogController")
    const SKIP = Number(req.query.skip)||0;
    const userID = req.session.user.userID;
    console.log("userID in readMyBlogController",userID);
    try{
    console.log("entered into try blog")
    const userBlogsDB = await blogModel.readMyBlogsModel({SKIP,userID});
    console.log("userBlogsDB",userBlogsDB)
 
 
 
    return res.send({
        status :200,
        message:`get user's blog successfully for userID ${userID}`,
        data: userBlogsDB,
    })
}
catch(err){
    return res.send({
        status:500,
        message:"db error",
        error:err.toString(),
    })
}
 
}
const editBlogController=async(req,res)=>{
    //user can edit only his own blogs not anyone else's
    const{title,textBody,blogID} = req.body;
    const userID = req.session.user.userID;
    //data validation
   try{
   await validateBlogData({title,textBody});
   }
   catch(err){
    return res.send({
        status:400,
        message:"invalid data!",
        error:err,
    })
 }
//find the blog based on blogID
    try{
        const editableBlog = await blogModel.blogWithBlogID({blogID});
        console.log("editableBlog",editableBlog);
        console.log(userID);
        //compare the userID of blog with the userID of logged in user
        if(!userID.toString().equals(editableBlog.userID.toString())){
            return res.send({
                status:400,
                message:"impermissible action!",
            })
        }
        //update the blog
            const blogObj = new blogModel({title,textBody,userID});
            const updatedBlog = await blogObj.editBlogModel({blogID});
            console.log("updatedBlog",updatedBlog);
 
        return res.send({
            status :200,
            message:"get user's blog edited successfully",
            data:"userBlogsDB",
        })
    }
    catch(err){
        console.log(err);
        return res.send({
            status:500,
            message:"db error",
            error:err,
        })
 
    }
 
 
 
 
 
}
const deleteBlogController=async(req,res)=>{
       //user can delete only his own blogs not anyone else's
 
        const {blogID} =  req.body;
        const userID =req.session.user.userID;
       //find the blog on the basis of blogID
       //blogWithblogID is an static method so we can use this method directly with the blogModel class
       try{
       const deleteBlog  = await blogModel.blogWithBlogID({blogID});
       console.log("deleteBlog",deleteBlog);
       //compare the userID of blog with the userID of logged in user
       if(!userID.equals(deleteBlog.userID))return res.send({status:400,message:"action not allowed"});   
 
    const deleteDB =    await blogModel.deleteBlog({blogID});
       return res.send({status:200,message:"blog deleted successfully",data:deleteDB});
    }
       catch(error){
        return res.send({
            status:500,
            message:"db error",
            error:error.toString(),
        })
       }
 
 
}
const restoreBlogController = async (req,res) => {
    //console.log("inside restore controller")
    const {blogID} = req.body;
    console.log("blogID of restore blog controller",blogID)
    //console.log("blog id ",blogID);
    const userID = req.session.user.userID;
    console.log("userID , ",userID);
    if(!blogID){
        return res.send({
            status:400,
            message:"No blog Id is provided"
        })
    }
 
    // ownership check
    try {
        const blogDb = await blogModel.blogWithBlogID({blogID});
        //console.log("blog db from getblogbyid",blogDb);
        // console.log(userID.toString(),blogDb.userID.toString());
        if(blogDb.userID.toString() !== userID.toString()){
            return res.send({
                status:403,
                message:"Forbidden request",
                error:"you are not allowed to use this feature on someone else's blog",
            })
        }
    } catch (error) {
        return res.send({
            status:500,
            message:"Internal server error in ownership",
            error : error.toString(),
        })
    }
 
    try{
        const restoredBlog = await blogModel.restoreBlogModel({blogID});
        //console.log("restored blog - ",restoredBlog);
        return res.send({
            status:200,
            message:"Blog is being moved from trash",
            restoredBlog,
        })
    }
    catch(err){
        return res.send({
            status:500,
            message:"Internal Server Error in trash",
            error:err.toString(),
        })
    }
}
const trashedBlogsController = async (req, res) => {
    console.log("enetered in trash blog controller!");
    const userID = req.session.user?.userID;
    console.log("userID from session:", userID); // Make sure this is a valid ObjectId string
    if (!userID) {
        return res.status(400).send({
            message: "User ID not found in session",
        });
    }
    // Ensure that userID is a valid ObjectId format
    if (!ObjectId.isValid(userID)) {
        return res.status(400).send({
            message: "Invalid userID format",
        });
    }

    try {
        const trashedDb = await blogModel.trashedBlogModel({ userID });
        console.log("trashedDB", trashedDb);
        
        if (trashedDb.length === 0) {
            return res.status(404).send({
                message: "No trashed blogs found",
            });
        }

        return res.status(200).send({
            message: "Trashed blogs found",
            trashedBlogs: trashedDb,
        });
    } catch (error) {
        console.error("Trash error:", error);
        return res.status(500).send({
            message: "Internal server error",
            error: error.message || error,
        });
    }
};
const commentBlogController = async (req, res) => {
 
    const {blogID,text} = req.body;
    const userID = req.session.user.userID;
    console.log("blogID,text,userID",blogID,text,userID);
     try 
     {
      const blogDB = await blogModel.blogWithBlogID({ blogID });
 
      if (!blogDB) {
        return res.status(404).send({
          message: `Blog with ID ${blogID} not found in the database`,
          status: 404,
          success: false,
        });
      }
 
       const CommentDB = new commentService({userID,blogID,text});
       const Comments = await CommentDB.createComment();
       console.log("Comments",Comments);
 
      res.send({
        status: 200,
        message: "Comment added successfully",
        success: true,
        comments: Comments, // Send back updated comments
      });
    } 
    catch (error) {
      res.status(500).send({
        status: 500,
        message: "Database error",
        error: error.toString(),
        success: false,
      });
    }
  };
 const readCommentsController=async(req,res)=>{
  try{
    const {blogID} = req.params;
    const skip = Number(req.query.skip) || 0 ;
    if(!blogID){
        return res.status(400).json({
            status:400,
            message:"Comments can not be fetched without blogID",
        });
    }
    const commentsDB = await commentModel.readComment({blogID,skip});
    return res.send({
        status:200,
        message:"comments fetched successfully",
        data:commentsDB,
    })
  }
  catch(error){
    console.log("comments error",error.toString());
     return res.status(500).json({message:"Internal server error"});
  }
 }
 
  const likeBlogController = async(req, res) => {
    const userID = req.session.user.userID;
    const { blogID } = req.body;
 
    try {
        const blogDB = await blogModel.blogWithBlogID({ blogID });    
 
        if (!blogDB) {
            return res.status(404).json({
                message: `Cannot find blog with blogID: ${blogID}`,
                status: 404,
                success: false,
            });
        }
 
        // Initialize likedUsers array if it doesn't exist
        if (!blogDB.likedUsers) {
            blogDB.likedUsers = [];
        }
 
        const userIDString = userID.toString();
        const alreadyLiked = blogDB.likedUsers.some(id => id.toString() === userIDString);
 
        if (alreadyLiked) {
            // User already liked, so unlike
            blogDB.likes = Math.max(0, (blogDB.likes || 0) - 1); // Ensure likes doesn't go below 0
            blogDB.likedUsers = blogDB.likedUsers.filter(id => id.toString() !== userIDString);
        } else {
            // User hasn't liked, so add like
            blogDB.likes = (blogDB.likes || 0) + 1;
            blogDB.likedUsers.push(userID);
        }
 
        await blogDB.save();
 
        return res.status(200).json({
            message: alreadyLiked ? "Blog unliked" : "Blog liked",
            status: 200,
            success: true,
            likes: blogDB.likes,
            liked: !alreadyLiked
        });
    } catch (error) {
        console.error("Like error:", error);
        return res.status(500).json({
            message: "Database error",
            error: error.toString(),
            status: 500,
            success: false,
        });
    }
};
 
// Get Blog Details Controller
const getBlogDetailsController = async (req, res) => {
    const { blogID } = req.params;
    const userID = req.session.user ? req.session.user.userID : null;
 
    try {
        const blogDB = await blogModel.blogWithBlogID({ blogID });
 
        if (!blogDB) {
            return res.status(404).json({
                message: `Cannot find blog with blogID: ${blogID}`,
                success: false
            });
        }
 
        // Filter out any null values and then check if user has liked
        const likedUsers = (blogDB.likedUsers || []).filter(id => id != null);
        const likedByUser = userID ? likedUsers.some(id => 
            id && id.toString() === userID.toString()
        ) : false;
 
        res.status(200).json({
            message: "Fetched blog successfully",
            success: true,
            likes: blogDB.likes || 0,
            likedByUser: likedByUser,
            blog: {
                _id: blogDB._id,  // Fixed the syntax error here (_id instead of *id)
                title: blogDB.title,
                textBody: blogDB.textBody,
                image: blogDB.image,
                creationDateTime: blogDB.creationDateTime,
                userID: blogDB.userID,
                likes: blogDB.likes || 0,
                comments: blogDB.comments || [],
            }
        });
    } catch (error) {
        console.error("Get blog details error:", error);
        res.status(500).json({
            message: "Database error",
            error: error.toString(),
            success: false
        });
    }
};

 
 
module.exports = {
    createBlogController,
    readMyBlogController,
    raedBlogController,
    editBlogController,
    deleteBlogController,
    restoreBlogController,
    trashedBlogsController,
    readCommentsController,
    commentBlogController,
    likeBlogController,
    getBlogDetailsController
};