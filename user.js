const mongoose = require("mongoose");
const bcrypt = require("bcryptjs") //Password Hashing (If You're Storing Real Passwords) You should never store raw passwords

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
        validate: {
            validator: function (v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: (props) => `${props.value} is not a valid email!`
        }
    },
    password: {
        type: String,
        required: true,
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

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

module.exports = mongoose.model("User", userSchema);
