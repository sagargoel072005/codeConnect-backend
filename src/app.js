const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken"); // npm i jsonwebtoken
const initializeSocket = require("./utils/socket");
const session = require("express-session");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token"); //npm install agora-access-token
require("dotenv").config();
require("./utils/cronjob"); 

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://codeconnect.shop"
  ],
  credentials: true,
}));

app.use(session({
  secret: "some-secret",
  resave: false,
  saveUninitialized: false,
}));

app.use(express.json());
app.use(cookieParser()); // npm i cookie-parser 

const APP_ID = process.env.APP_ID;
const APP_CERTIFICATE = process.env.APP_CERTIFICATE;

app.use("/uploads", express.static("uploads"));

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const postRouter = require("./routes/post");
const chatRouter = require("./routes/chat");
const PeRouter = require("./routes/profileRoutes")
const githubAuthRouter = require("./routes/githubAuth");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);
app.use("/profile", PeRouter);
app.use("/posts", postRouter);
app.use("/", githubAuthRouter);
app.get("/token/:channel/:uid", (req, res) => {
  const channel = req.params.channel;
  const uid = parseInt(req.params.uid, 10) || 0;
  const role = RtcRole.PUBLISHER;
  const expiration = Math.floor(Date.now() / 1000) + 3600;

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channel,
    uid,
    role,
    expiration
  );
  res.json({ rtcToken: token, uid });
});


const server = http.createServer(app);
initializeSocket(server);


connectDB()
    .then(() => {
        console.log("database established");
        server.listen(process.env.PORT, "0.0.0.0",() => {
            console.log("server is successfuly listening on port 7777....");
        });
    })
    .catch((err) => {
        console.log("database not established", err);
    });


