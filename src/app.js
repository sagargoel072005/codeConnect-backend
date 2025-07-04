const express = require("express");
const connectDB = require("./config/database");
const app = express();
const { userAuth } = require("./middlewares/auth");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
require("./utils/cronjob");

const jwt = require("jsonwebtoken"); // npm i jsonwebtoken

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

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);

connectDB()
    .then(() => {
        console.log("database established");
        app.listen(process.env.PORT, "0.0.0.0",() => {
            console.log("server is successfuly listening on port 7777....");
        });
    })
    .catch((err) => {
        console.log("database not established", err);
    });


