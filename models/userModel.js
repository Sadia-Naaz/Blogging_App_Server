const userSchema = require("../Schemas/userSchema");

const ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcryptjs");
const User = class {
    constructor({name,email,username,password}){
        this.name=name;
        this.email=email;
        this.username=username;
        this.password=password;
    }
    
    async registerUser() {
      // Check if user already exists
      const existingUser = await userSchema.findOne({
        $or: [{ username: this.username }, { email: this.email }],
      });
    
      if (existingUser && this.username === existingUser.username) {
        throw new Error("Username already exists");
      }
      if (existingUser && this.email === existingUser.email) {
        throw new Error("Email already exists");
      }
    
      const hashedPassword = await bcrypt.hash(this.password, parseInt(process.env.SALT));
      
      const userObj = new userSchema({
        name: this.name,
        email: this.email,
        username: this.username,
        password: hashedPassword,
      });
    
      try {
        const userDB = await userObj.save(); // ✅ make sure to await
        return userDB;
      } catch (err) {
        // MongoDB duplicate key error fallback
        if (err.code === 11000) {
          if (err.keyPattern?.email) throw new Error("Email already exists");
          if (err.keyPattern?.username) throw new Error("Username already exists");
          throw new Error("User already exists");
        }
        throw err;
      }
    }
    
   static async findUserWithKey({ key }) {
    try {
      const userData = await userSchema
        .findOne({
          $or: [
            ObjectId.isValid(key) ? { _id: key } : { email: key },
            { username: key },
          ],
        })
        .select("+password");
  
      if (!userData) throw new Error("No data found regarding these credentials");
  
      return userData;
    } catch (error) {
      console.log("findUserWithKey error:", error);
      throw new Error(`Error in finding user with provided credentials:${error.message}`);
    }
  }
}  
module.exports = User;