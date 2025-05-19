const express = require("express");
const { userAuth } = require("../middlewares/auth");
const userRouter = express.Router();
const User = require("../models/user")
const ConnectionRequest = require("../models/connectionRequest");

const USER_SAFE_DATA = "firstName lastName photoUrl age gender about skills"

// get all the pending connection request for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
      const loggedInUser = req.user;

      const connectionRequest = await ConnectionRequest.find({
          toUserId: loggedInUser._id,
          status: "interested",
      }).populate("fromUserId", USER_SAFE_DATA);

      res.json({
          message: "Connection requests are:",
          data: connectionRequest,
      });
//.map((req) => req.fromUserId),
  } catch (err) {
      res.status(400).send("ERROR: " + err.message);
  }
});


// finding the number of user collection of status accepted
userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;

        const connectionRequests = await ConnectionRequest.find({
            $or: [
                { toUserId: loggedInUser._id, status: "accepted" },
                { fromUserId: loggedInUser._id, status: "accepted" },
            ],
        }).populate("fromUserId", USER_SAFE_DATA).populate("toUserId", USER_SAFE_DATA);

        const data = connectionRequests.map((row) => {
            if (row.fromUserId._id.toString() === loggedInUser._id.toString()) { //we cant compare two ids directly in mongodb so we hv to convert it into strings
                return row.toUserId;
            }
            return row.fromUserId;
        });

        res.json({ data });
    } catch (err) {
        res.statusCode(400).send("ERROR: " + err.message);
    }
});


// feed api gets you the profiles of other users on platform
userRouter.get("/feed", userAuth, async (req, res) => {
    try {
      const loggedInUser = req.user;
  
      const page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 12;
      limit = limit > 70 ? 70 : limit;
      const skip = (page - 1) * limit;
  
      const connectionRequest = await ConnectionRequest.find({
        $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
      }).select("fromUserId toUserId");
  
      const hiddenUserFromFeed = new Set();
      connectionRequest.forEach((req) => {
        hiddenUserFromFeed.add(req.fromUserId.toString());
        hiddenUserFromFeed.add(req.toUserId.toString());
      });
  
      const users = await User.find({
        _id: { $nin: Array.from(hiddenUserFromFeed).concat(loggedInUser._id.toString()) },
      })
        .select(USER_SAFE_DATA)
        .skip(skip)
        .limit(limit);
      res.send({ data: users });
  
    } catch (err) {
      res.status(400).send({ error: err.message });
    }
  });
  

module.exports = userRouter;
