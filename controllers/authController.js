const {verifyUserDetails, genrateToken, sendVerificationMail} = require("../utils/isAuth");
const User = require("../models/userModel")
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");

const loginController = async (req, res) => {
    const { loginID, password } = req.body;
  
    try {
      // 1. Check if user exists
      const userDB = await User.findUserWithKey({ key: loginID });
  
      // 2. Check if email is verified
      if (!userDB.isEmailVerified) {
        return res.status(400).json({
          success: false,
          message: "Please verify your email first",
        });
      }
  
      // 3. Compare password
      const isMatched = await bcrypt.compare(password, userDB.password);
      if (!isMatched) {
        return res.status(400).json({
          success: false,
          message: "Incorrect password",
        });
      }
  
      // 4. Set session
      try {
        req.session.isAuth = true;
        req.session.user = {
          userID: userDB._id,
          username: userDB.username,
          email: userDB.email,
        };
  
        return res.status(200).json({
          success: true,
          message: "Login successful",
        });
      } catch (sessionError) {
        console.error("Session error:", sessionError);
        return res.status(500).json({
          success: false,
          message: "Failed to initiate session",
        });
      }
    } catch (error) {
      console.error("Login error:", error.message);
      return res.status(500).json({
        success: false,
        message: error.message || "Server error",
      });
    }
  };
  
//register controller
const signUpController = async (req, res) => {
    const { name, email, username, password } = req.body;
  
    try {
      await verifyUserDetails({ email, username, password });
    } catch (err) {
      console.log("Validation error:", err.message);
      return res.status(400).json({
        success: false,
        message: err.message || "User information is not valid",
      });
    }
  
    const userModelObj = new User({ name, email, password, username });
  
    try {
        const userDB = await userModelObj.registerUser();
        const token = genrateToken(email);
        const result = await sendVerificationMail(email, token);
      
        if (!result.success) {
          return res.status(500).json({
            success: false,
            message: result.message,
          });
        }
      
        return res.status(200).json({
          success: true,
          message: result.message,
        });
      
      } catch (err) {
        console.log("Registration error:", err.message);
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      
  };
  

//logout controller

const logoutController = async(req,res)=>{

        req.session.destroy((err)=>{
            if(err){
                return res.send({
                    success:false,
                    status:500,
                    message:"internal server error"
                });
             }
             //after destroying the session we have to clear cookie explicitly
          res.clearCookie("connect.sid",{
          httpOnly:true,
          secure:false,
          samesite:"lax",
          maxAge: 90 * 24 * 60 * 60 * 1000,

            })
           
                return res.send({
                    success:true,
                    status:200,
                    message:"logout successfull!",
                })
            

});
}


module.exports = {loginController,signUpController,logoutController};