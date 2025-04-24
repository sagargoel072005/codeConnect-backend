const express = require("express");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");

// get all the pending connection request for the loggedIn user
userRouter.get("/user/requests/received",userAuth,async(req,res)=>{
try{

const loggedInUser = req.user;
const connectionRequest = await ConnectionRequest.find({
    toUserId: loggedInUser._id,
    status:"interested",
}).populate("fromUserId",["firstName","lastName"]);

res.json({
    message: "connection request are :",
    data : connectionRequest,
})

}catch(err){
    req.statusCode(400).send("ERROR: " + err.message);
}
});

module.exports = userRouter;
