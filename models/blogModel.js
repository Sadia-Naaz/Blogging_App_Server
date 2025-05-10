const { ObjectId } = require("mongodb");
const { LIMIT } = require("../privateConstants");
const userBlogSchema = require("../Schemas/userBlogSchema");
//in model we are doing all the data related stuff.
const blogModel = class{
    constructor({title,textBody,userID,image,likes=0,likedUsers=[]}){
        this.title=title;
        this.textBody=textBody;
        this.userID = userID;
        this.image = image;
        this.likes = likes;
        this.likedUsers = likedUsers
    };
    //creating a blog will be a dynamic function because it will always take dynamic text .
    createBlogModel(){
        return new Promise(async(res,rej)=>{
            const blogObj = new userBlogSchema({
                title:this.title,
                textBody:this.textBody,
                creationDateTime:Date.now(),
                userID:this.userID,
                image:this.image,
                likes:this.likes,
                likedUsers:this.likedUsers,
             })
            try
            {
        
            const newBlog = await blogObj.save();
           
            console.log('newBlog',newBlog)
            res(newBlog);
            
            }
            catch(err){
                rej(err);
            }
        })
    }
    //getting all the values from the db reading does't require a dynamic entry so it can be static
   static readBlogModel({SKIP}){
   return new Promise(async(res,rej)=>{
    try{
        let blogDB = await userBlogSchema.aggregate([
        // {$match:{isDeleted:{$ne:true}}},
        {$sort:{creationDateTime:-1}},
        {$skip:SKIP},
        {$limit:LIMIT},
        { 
            $project: { // Ensure image and other required fields are selected
                title: 1,
                textBody: 1,
                creationDateTime: 1,
                userID: 1,
                image: { $ifNull: ["$image", ""] } // Include image field here
            } 
        }
]);
console.log(blogDB)
      blogDB = await userBlogSchema.populate(blogDB,{
        path:'userID',
        model:'blogger',
      })
     res(blogDB);
    }
    catch(err){
        console.log("error:",err);
        rej(err);
    }
   })
   }
   //now getting only user created posts
   static readMyBlogsModel({SKIP,userID}){
    console.log("enetered into readMyBlogModel");
    return new Promise (async(res,rej)=>{
        try{
            let userBlogDB = await userBlogSchema.aggregate([
                {$match:{userID:userID ,isDeleted:{$ne:true}}}
                ,
                {$sort:{creationDateTime:-1}}
                ,
                {$skip:SKIP}
                ,
                {$limit:LIMIT},
                { 
                    $project: { // Include image and other necessary fields
                        title: 1,
                        textBody: 1,
                        creationDateTime: 1,
                        userID: 1,
                        image: 1 // Ensure image field is included
                    } 
                }
            ])
            console.log("userBlogDB",userBlogDB)
         if(!userBlogDB || userBlogDB.length===0){return rej("Either you don't have created any blog yet or there are no more blogs of yours")}
         
         userBlogDB = await userBlogSchema.populate(userBlogDB,{
            path:'userID',
            model:'blogger',
            select: 'username',
         })
      
         console.log('userBlogDB',userBlogDB)
            res(userBlogDB);
            
        }
        catch(err){
            console.log(err.toString());
         rej(err)

        }
       
        
    })
    
}
//finding the blog with the help of blogID;
   static blogWithBlogID({blogID}){
    return new Promise(async(res,rej)=>{
        if(!blogID) rej("missing blogID");
        //check the blogID format,because blogID is an object ID so we have to compare this way only
        if(!ObjectId.isValid(blogID))rej("invalid blogID");
        try{
    
        const blog = await userBlogSchema.findOne({_id:blogID});
        res(blog);
        }
        catch(error){
        rej(error)
        }
   })
}
//updating the blog 

   editBlogModel({blogID}){
    return new Promise(async(res,rej)=>{
        try{
        const updatedBlog = await userBlogSchema.findOneAndUpdate({_id:blogID},{title:this.title,textBody:this.textBody},{new:true});
        res(updatedBlog);
        }
        catch(err){
        rej(err);
        }


    })   
   }

   //Delete blog based on blogID;
   static deleteBlog({blogID}){
    return new Promise(async(res,rej)=>{
       try{ 
        const deletedBlog = await userBlogSchema.findOneAndUpdate({_id:blogID},{isDeleted:true,deletetionDateTime:Date.now()}, { new: true });
       res(deletedBlog);
    }
    catch(err){
        rej(err);
    }
    })
   }
   static restoreBlogModel = ({blogID}) => {
    return new Promise(async(resolve,reject)=>{
        try{
            // move blog to trash
            const query = ObjectId.isValid(blogID) ? { _id: blogID } : { title: blogID };
            const blogObj = await userBlogSchema.findOneAndUpdate(query, { isDeleted: false, deletionDateAndTime:null});
            // console.log(blogObj);
            if(!blogObj){
                return reject("Blog doesn't exist");
            }
            resolve(blogObj);
        }
        catch(err){
            reject(err);
        }
    })
}
static trashedBlogModel = ({userID}) => {
    return new Promise(async(resolve,reject)=>{
        try {
            const trashedDb = await userBlogSchema.find({userID:userID,isDeleted:true}).populate('userID').sort([['deletionDateTime',-1]]);
            if (trashedDb.length === 0) {
                reject("No blog found in trash");
            }
            
            resolve(trashedDb);
        } catch (error) {
            reject(error);
        }
    })
}
}
module.exports = blogModel;