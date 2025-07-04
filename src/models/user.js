const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken"); // npm i jsonwebtoken

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        index: true,
        minLength: 4,
        maxLength: 50,
    },

    lastName: {
        type: String
    },

    emailId: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true, // removes white spaces
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email address" + value);
            }
        }
    },

    password: {
        type: String,
        required: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("enter a strong password" + value);
            }
        }
    },

    age: {
        type: Number,
        min: 15,
    },

    gender: {
        type: String,
        enum: {
            values: ["male", "female", "others"],
            message: `{VALUE} is not a valid gender type`
        }
    },
    isPremium: {
        type: Boolean,
        default: false,
    },
    membershipType: {
        type: String,
    },

    photoUrl: {
        type: String,
        default: "https://s3.amazonaws.com/37assets/svn/765-default-avatar.png",
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error("Invalid photo URL" + value);
            }
        }
    },

    about: {
        type: String,
        default: "Hello,I am a developer ",
    },

    skills: {
        type: [String],
        validate: {
            validator: function (skills) {
                return skills.length <= 10;
            },
            message: "You can add a maximum of 10 skills.",
        }
    }
},

    {
        timestamps: true,
    });

//creating index  -  compound index
userSchema.index({ fromUserId: 1, toUserId: 1 });

// create a JWT token
userSchema.methods.getJWT = async function () {
    // arrow function will not work here
    const user = this; //this function is compatible with older functions
    const token = await jwt.sign({ _id: user._id }, "SAGAR@!@#", {
        expiresIn: "1d",
    });
    return token; //hidden data + secret key
};


module.exports = mongoose.model("User", userSchema);
