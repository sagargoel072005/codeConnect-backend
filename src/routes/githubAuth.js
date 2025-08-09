const express = require("express");
const axios = require("axios");
const jwt = require("jsonwebtoken");
const { userAuth } = require("../middlewares/auth");
const User = require("../models/user");

const router = express.Router();

const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "https://www.codeconnect.shop";
const BACKEND_URL = process.env.BACKEND_URL || "https://www.codeconnect.shop";

// Step 1: Redirect logged-in user to GitHub OAuth login page
router.get("/auth/github/login", userAuth, (req, res) => {
  const redirectUri = `${BACKEND_URL}/auth/github/callback`;
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=read:user repo&redirect_uri=${redirectUri}`;
  res.redirect(githubUrl);
});

// Step 2: GitHub OAuth callback — NO userAuth middleware here
router.get("/auth/github/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("Missing code from GitHub");

  try {
    // Get JWT token from cookie
    const token = req.cookies.token;
    if (!token) return res.status(401).send("Not authenticated");

    // Verify JWT to get user id
    const decodeObj = jwt.verify(token, process.env.JWT_TOKEN);
    const user = await User.findById(decodeObj._id);
    if (!user) return res.status(404).send("User not found");

    // Exchange code for GitHub access token
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
      },
      { headers: { Accept: "application/json" } }
    );

    const accessToken = tokenResponse.data.access_token;
    if (!accessToken) return res.status(400).send("Failed to get access token");

    // Fetch GitHub user profile
    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${accessToken}` },
    });

    // Save GitHub data to user in DB
    user.githubToken = accessToken;
    user.githubUsername = userResponse.data.login;
    user.githubId = userResponse.data.id;
    user.githubProfileUrl = userResponse.data.html_url;
    await user.save();

    // Redirect to frontend profile page
    res.redirect(`${FRONTEND_URL}/profile?github=connected`);
  } catch (err) {
    console.error("GitHub OAuth error:", err.message);
    res.status(500).send("GitHub OAuth failed");
  }
});

// Fetch user repos from GitHub
router.get("/auth/github/repos", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user.githubToken)
      return res.status(400).json({ error: "GitHub account not connected" });

    const reposRes = await axios.get("https://api.github.com/user/repos", {
      headers: { Authorization: `token ${user.githubToken}` },
      params: { sort: "updated", per_page: 50 },
    });

    res.json(reposRes.data);
  } catch (err) {
    console.error("Error fetching GitHub repos:", err.message);
    res.status(500).json({ error: "Failed to fetch GitHub repositories" });
  }
});

module.exports = router;
