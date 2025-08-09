const express = require("express");
const Post = require("../models/post");
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { createPost, toggleLike, addComment } = require("../controller/postController");
const { userAuth } = require("../middlewares/auth");
require("dotenv").config();

const PostRouter = express.Router();

// AWS S3 config
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
});

// Multer S3 storage setup (supports images + videos)
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE, // keeps correct MIME type for images/videos
    key: (req, file, cb) => {
      cb(null, `${Date.now().toString()}-${file.originalname}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "video/mp4",
      "video/mpeg",
      "video/quicktime"
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed!"), false);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 } // Max 50MB
});


// Get posts for a user
PostRouter.get("/user/:id", userAuth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id })
      .populate("user", "firstName lastName profilePicture")
      .populate("comments.user", "firstName lastName");
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a post + remove from S3
PostRouter.delete("/:id", userAuth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Remove file from S3 if exists
    if (post.mediaUrl) {
      const fileKey = post.mediaUrl.split("/").pop(); // Extract filename from URL
      await s3
        .deleteObject({
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: fileKey
        })
        .promise();
    }

    await post.deleteOne();
    res.json({ message: "Post and media deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create post (upload image or video to S3)
PostRouter.post("/", userAuth, upload.single("media"), createPost);

// Like a post
PostRouter.post("/:id/like", userAuth, toggleLike);

// Add comment to a post
PostRouter.post("/:id/comment", userAuth, addComment);

module.exports = PostRouter;
