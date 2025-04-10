const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
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
        min: 18,
    },
    gender: {
        type: String,
        validate(value) {
            if (!["male", "female", "others"].includes(value)) {
                throw new Error("Gender data is not valid");
            }
        },
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
}, {
    timestamps: true,
});


module.exports = mongoose.model("User", userSchema);
