const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");
const jwt = require("jsonwebtoken"); // npm i jsonwebtoken
const initializeSocket = require("./utils/socket");

require("dotenv").config();
require("./utils/cronjob"); 


app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://codeconnect.shop"
  ],
  credentials: true,
}));



app.use(express.json());
app.use(cookieParser()); // npm i cookie-parser 

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const chatRouter = require("./routes/chat");



app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);
app.use("/", chatRouter);

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


