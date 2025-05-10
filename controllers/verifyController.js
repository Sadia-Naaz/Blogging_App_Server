
const jwt = require("jsonwebtoken");
const userSchema = require("../Schemas/userSchema");
const verifyController= async(req,res)=>{
        console.log(req.params);
        const token = req.params.token;
      
        const email = jwt.verify(token, process.env.SECRET_KEY);
        console.log(email);
      
        try {
          await userSchema.findOneAndUpdate(
            { email: email },
            { isEmailVerified: true }
          );
         
          console.log("email verified");
          //after verifying mail we have to send cookie to frontend containging jwt token 
          console.log("req.cookies",req.cookies);
          res.cookie("jwt",token, { secure: false, httpOnly: true , maxAge:90*24*60*60*1000})
         .status(200)
         .send('Email verification successful and cookie set.');
          console.log(req.cookies);
         
        
        } catch (error) {
            console.log(error);
             // If JWT verification fails, it could mean the token has expired. Respond with a 401 status.
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
    }
          return res.status(500).json(error);
        }
      };
      
module.exports = verifyController;