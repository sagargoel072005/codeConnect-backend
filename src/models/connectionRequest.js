const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({

    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // creating reference to user
        required: true,
    },
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // creating reference to user
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: {
            values: ["ignored", "interested", "accepted", "rejected"],
            message: `{VALUE} is an incorrect status`
        },
    },
},
    {
        timestamps: true,
    });

//creating index  -  compound index
connectionRequestSchema.index({fromUserId:1,toUserId:1});

// event handler , normal this function
connectionRequestSchema.pre("save", function (next) {
    const connectionRequest = this;
    // check if fronUserId is same as toUserId
    if(connectionRequest.fromUserId.equals(connectionRequest.toUserId)){
        throw new Error("cannot send connection to yourself!!!!!");
    }
    next(); //call next as middleware
});

const ConnectionRequestModel = new mongoose.model(
    "ConnectionRequest",
    connectionRequestSchema
);

module.exports = ConnectionRequestModel;