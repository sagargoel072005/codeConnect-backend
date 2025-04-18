const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken"); // npm i jsonwebtoken
const { userAuth } = require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser()); // npm i cookie-parser 

app.post("/signup", async (req, res) => {
    try {
        //validation of data
        validateSignUpData(req);
        const { firstName, lastName, emailId, password } = req.body;
        //encryption of password
        const passwordHash = await bcrypt.hash(password, 10);
        //creating a new instance of user
        const user = new User({
            firstName, lastName, emailId, password: passwordHash,
        });
        await user.save();
        res.send(" user added successfullly");
    } catch (err) {
        res.status(400).send("error saving the user : " + err.message);
    }

});

app.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId: emailId });
        if (!user) {
            throw new Error("EmailId is not present in DB");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {

            // create a JWT token
            const token = await user.getJWT();  // offloads token logic to schema methods
          
            res.cookie("token", token, {
                expires: new Date(Date.now() + 8 * 3600000),
            });
            res.send("login successfull!!!!");
        } else {
            throw new Error("Password is not correct");
        }
    } catch (err) {
        res.status(400).send("error saving the user : " + err.message);
    }
});

app.get("/profile", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (err) {
        res.status(400).send("ERROR:" + err.message);
    }
});

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


