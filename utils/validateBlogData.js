const validateBlogData = ({title,textBody})=>{
    return new Promise ((res,rej)=>{
        if(!title ||!textBody) return rej('Please fill in all fields');
        if(title.length <3 ||title.length>100) return rej("character length should be between 3-500 characters of Title");
        if(textBody.length < 3 || textBody.length>2000) return rej("character length of blog should be between 3-2000 characters")
        if(typeof title !== "string") return rej("text Type is not string");
        if(typeof textBody !== "string") return rej("text Type is not string");
        res();
    })
   
}
module.exports = validateBlogData;