const cron = require('node-cron');
const userBlogSchema = require('../Schemas/userBlogSchema');


const cleanupBin = () => {
    cron.schedule("* * 0 * * *", async () => {
        //find all the blogs where isDeleted : true
        //if deletionDateTime > 30 days
        //Delete the blog
    
        try {
          const deletedBlogs = await userBlogSchema.find({ isDeleted: true });
    
          let deletedBlogIds = [];
          // console.log('hi');
          if (deletedBlogs.length > 0) {
            deletedBlogs.map(async (blog) => {
              const diff =
                (Date.now() - blog.deletetionDateTime) / (1000 * 60 * 60 * 24);

              if (diff > 30) {
                deletedBlogIds.push(blog._id);
              }
            });
    
            if (deletedBlogIds.length > 0) {
              try {
                const deletedBlog = await blogSchema.findOneAndDelete({
                  _id: { $in: deletedBlogIds },
                });
                // console.log(
                //   `Blog has been deleted successfully : ${deletedBlog._id}  , title : ${deletedBlog.title}`
                // );
              } catch (error) {
                console.log(error);
              }
            }
          }
        } catch (error) {
          console.log(error);
        }
      });
}


module.exports = cleanupBin;