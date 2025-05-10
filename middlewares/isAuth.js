const AuthenticateSession =(req,res,next)=>{
    if(req.session.isAuth){
        console.log(`Request received: ${req.method} ${req.url}`);
        next();
    }
    else{
        res.send({
            status:401,
            message:"Session does't exist",
        })
    }
}
// const authenticateToken = (req, res, next) => {
    // const token = req.cookies.token; // get the token from the cookie
    // if(!token) {
    //     return res.status(403).send({message: "No token provided"});
    // }
    // jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    //     if(err) {
    //         return res.status(500).send({message: "Failed to authenticate token"});
    //     }
    //     req.userId = decoded.id; // save the decoded user id to the request for use in other routes
    //     next();
    // });
// }

module.exports = AuthenticateSession;