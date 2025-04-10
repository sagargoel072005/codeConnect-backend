const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");

app.use(express.json());

app.post("/signup", async (req, res) => {
    console.log(req.body);
    const user = new User(req.body);
    await user.save();
    res.send("successfullly");
});

app.get("/user", async (req, res) => {
    const userEmail = req.body.emailId;
    try {
        const user = await User.find({ emailId: userEmail });
        console.log("MongoDB result:", user);
        if (user.length === 0) {
            res.status(404).send("user not found");
        } else {
            res.send(user);
        }
    } catch (err) {
        res.status(400).send("something went wrong");
    }
});

app.patch("/user/:userId", async (req, res) => {
    const userId = req.params?.userId;
    const data = req.body;
    console.log("Body:", data);

    try {

        const ALLOWED_UPDATES = ["photoUrl", "emailId", "about", "gender", "age", "skills"];
        const IsUpdateAllowed = Object.keys(data).every((k) =>
            ALLOWED_UPDATES.includes(k)
        );

        if (!IsUpdateAllowed) {
            res.status(400).send("update not allowed");
        }
        await User.findByIdAndUpdate({ _id: userId }, data,{
            returnDocument:"after",
            runValidators:true,
        });
        res.send("User found");
    } catch (err) {
        res.status(400).send("Something went wrong");
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


