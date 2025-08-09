const express = require("express");
const { getMyProfile } = require("../controller/profileController");
const { userAuth } = require("../middlewares/auth");
const PeRouter = express.Router();

PeRouter.get("/me", userAuth, getMyProfile);

module.exports = PeRouter;
