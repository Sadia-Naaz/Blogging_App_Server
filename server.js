const express = require("express");
const app = express();
require("./db");

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
const PORT = process.env.PORT;
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(morgan('dev'));//to see the url in the terminal



const allowedOrigins = [process.env.FRONTEND_URL];
const store = new mongodbsession({
    uri: process.env.MONGO_URI,
    collection: "sessions",
  });

  app.use(cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }));
  
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
            secure: true,// set this to true in production, when using HTTPS
            httpOnly: true,
            sameSite:"none",
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
