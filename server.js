const express = require("express");
const app = express();
require("./db");
const isProduction = process.env.NODE_ENV === "production";
require("dotenv").config();
const session = require("express-session");
const authRouter = require("./routers/authRouters");
const BlogRouter = require("./routers/blogRouters");
const FollowRouter = require("./routers/followRouter");
const UserRouter = require("./routers/userRouter");
const AuthenticateSession = require("./middlewares/isAuth");
const cleanUpBin = require("./models/trashCleanUp")
const mongodbsession = require("connect-mongodb-session")(session);
const cors = require('cors');
const morgan  = require("morgan");
const PORT = process.env.PORT || 8000;
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(morgan('dev'));//to see the url in the terminal
app.set('trust proxy', 1); // ✅ TRUST THE PROXY (REQUIRED for secure cookies)

console.log("backend url",process.env.FRONTEND_URL)
const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:5173"];
app.use(cors({
    origin:process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }));
const store = new mongodbsession({
    uri: process.env.MONGO_URI,
    collection: "sessions",
  });

  
app.use('/uploads', express.static('uploads'));

//middlewares
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(
    session({
        secret: process.env.SECRET_KEY,
        store: store,
        resave: false,
        saveUninitialized: false,
        cookie: {
            // secure: isProduction,// set this to true in production, when using HTTPS
            secure:false,
            httpOnly: false,
            sameSite:isProduction?"none":"lax",
            maxAge: 90 * 24 * 60 * 60 * 1000 // cookie expiration in milliseconds
          }
    })
);
//This must be written only after the session has been initialize else the router will get navigated to the controllers 
//and session will not be initialized.

app.get("/",(req,res)=>{
    return res.send({
        status:200,
        message:"Port is up and running",
    })
});
app.use("/auth" , authRouter);
app.use("/blog" , BlogRouter);
app.use("/follow" , AuthenticateSession , FollowRouter);
app.use("/user", UserRouter);

app.listen(PORT,()=>{
    console.log(`server is up and runing on port:${PORT}`);
    cleanUpBin();
})
