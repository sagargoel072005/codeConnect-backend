const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken"); // npm i jsonwebtoken

const userSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      index: true,
      minLength: 4,
      maxLength: 50,
    },

    lastName: {
      type: String,
    },

    emailId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email address: " + value);
        }
      },
    },

    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a strong password");
        }
      },
    },

    age: {
      type: Number,
      min: 15,
    },

    gender: {
      type: String,
      enum: {
        values: ["male", "female", "others"],
        message: `{VALUE} is not a valid gender type`,
      },
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
        if (!value) return true;

        if (validator.isURL(value)) return true;

        if (/\.(jpg|jpeg)$/i.test(value)) return true;

        throw new Error(
          "Invalid photo. Must be a valid URL or JPG/JPEG image."
        );
      },
    },

    about: {
      type: String,
      default: "Hello, I am a developer",
    },

    skills: {
      type: [String],
      validate: {
        validator: function (skills) {
          return skills.length <= 10;
        },
        message: "You can add a maximum of 10 skills.",
      },
    },

    githubId: {
      type: String,
      default: "",
    },

    linkedIn: {
      type: String,
      default: "",
    },

    leetcodeId: {
      type: String,
      default: "",
    },

    projects: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: "Maximum 10 projects allowed",
      },
    },

    certifications: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: "Maximum 10 certifications allowed",
      },
    },

    academicQualifications: {
      tenth: {
        school: { type: String, default: "" },
        board: { type: String, default: "" },
        percentage: { type: Number, min: 0, max: 100 },
      },
      twelfth: {
        school: { type: String, default: "" },
        board: { type: String, default: "" },
        percentage: { type: Number, min: 0, max: 100 },
      },
      ug: {
        degree: { type: String, default: "" },
        branch: { type: String, default: "" },
        sgpa: { type: Number, min: 0, max: 10 },
      },
      pg: {
        degree: { type: String, default: "" },
        branch: { type: String, default: "" },
        sgpa: { type: Number, min: 0, max: 10 },
      },
    },

    githubToken: { type: String },
    githubUsername: { type: String },
    githubProfileUrl: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound index example (verify fields exist in schema before using indexes)
userSchema.index({ fromUserId: 1, toUserId: 1 });

// JWT token generation method
userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, process.env.JWT_TOKEN, {
    expiresIn: "1d",
  });
  return token;
};

module.exports = mongoose.model("User", userSchema);
