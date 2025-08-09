const express = require("express");
const profileRouter = express.Router();
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");
const bcrypt = require("bcryptjs");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
    try {
        const user = req.user;
        res.send(user);
    } catch (err) {
        res.status(400).send("ERROR:" + err.message);
    }
});



profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
    try {
        if (!validateEditProfileData(req)) {
            throw new Error("INVALID EDIT REQUEST");
        }
        const loggedInUser = req.user;

        Object.keys(req.body).forEach((key) => {
            loggedInUser[key] = req.body[key]
        });

        await loggedInUser.save();

        res.json({
            message: `${loggedInUser.firstName},your profile updated successfly`,
            data: loggedInUser,
        });
    } catch (err) {
        res.status(400).send("ERROR:" + err.message);
    }
});


profileRouter.patch("/profile/edit/password", userAuth, async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            throw new Error("Password is required.");
        }
        //encryption of password
        const passwordHash = await bcrypt.hash(password, 10);
        // Update the existing user's password
        const user = req.user;
        user.password = passwordHash;
        await user.save();
        res.send(" password updated successfullly");
    } catch (err) {
        res.status(400).send("ERROR:" + err.message);
    }
});



module.exports = profileRouter;