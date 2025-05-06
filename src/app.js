const express = require("express");
const connectDB = require("./config/database");
const app = express();
const { userAuth } = require("./middlewares/auth");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const jwt = require("jsonwebtoken"); // npm i jsonwebtoken

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser()); // npm i cookie-parser 

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/Request");
const userRouter = require("./routes/user");

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);

connectDB()
    .then(() => {
        console.log("database established");
        app.listen(7777, () => {
            console.log("server is successfuly listening on port 7777....");
        });
    })
    .catch(() => {
        console.log("database not established");
    });


