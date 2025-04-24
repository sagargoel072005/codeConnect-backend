const express = require("express");
const requestRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest")
const User = require("../models/user");

requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        const allowedStatus = ["ignored", "interested"];

        // status validation
        if (!allowedStatus.includes(status)) {
            return res.status(400).json({ message: "Invalid status type: " + status });
        }

        // handling request to non-user
        const toUser = await User.findById(toUserId);
        if (!toUser) {
            return res.status(400).json({ message: "user not found" });
        }

        // if there is an existing ConnectionRequest
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                { fromUserId, toUserId },
                { fromUserId: toUserId, toUserId: fromUserId }
            ]
        });

        if (existingConnectionRequest) {
            return res.status(400).send({ message: "Connection Request already exists!!!!" })
        }

        const connectionRequest = new ConnectionRequest({
            fromUserId, toUserId, status
        });

        const data = await connectionRequest.save(); //saves in databse
        res.json({
            message: "Connection Request Sent Successfully",
            data,
        });
    } catch (err) {
        res.status(400).send("ERROR:" + err.message);
    }
});

requestRouter.post("/request/send/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const loggedInUser = req.user;
        const { status, requestId } = req.params;
        const reviewedStatus = ["accepted", "rejected"];

        // status validation
        if (!reviewedStatus.includes(status)) {
            return res.status(400).json({ message: "status type not allowed: " + status });
        }
        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: loggedInUser._id,
            status: "interested",
        });

        if (!connectionRequest) {
            return res.status(404).json({
                message: "Connection Request not found",
            });
        }

        connectionRequest.status = status;

        const data = await connectionRequest.save(); //saves in databse

        res.json({ message: "Connection Request " + status, data });

    } catch (err) {
        res.status(400).send("ERROR:" + err.message);
    }
});

module.exports = requestRouter;
