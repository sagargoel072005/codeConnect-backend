const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");
const bcrypt = require("bcryptjs");
const passport = require("passport");

authRouter.post("/signup", async (req, res) => {
    try {
        //validation of data
        validateSignUpData(req);
        const { firstName, lastName, emailId, password } = req.body;

        //encryption of password
        const passwordHash = await bcrypt.hash(password, 10);

        //creating a new instance of user
        const user = new User({
            firstName, lastName, emailId, password: passwordHash,
        });

        const savedUser = await user.save();

        const token = await savedUser.getJWT();

        res.cookie("token", token, {
            expires: new Date(Date.now() + 8 * 3600000),
        });

        res.json({
            message: " user added successfullly",
            data: savedUser
        });
    } catch (err) {
        res.status(400).send("error saving the user : " + err.message);
    }

});

authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;
        const user = await User.findOne({ emailId: emailId });
        if (!user) {
            throw new Error("EmailId is not present in DB");
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {

            // create a JWT token
            const token = await user.getJWT();  // offloads token logic to schema methods

            res.cookie("token", token, {
                expires: new Date(Date.now() + 8 * 3600000),
            });
            res.send("login successfull!!!!");
        } else {
            throw new Error("Password is not correct");
        }
    } catch (err) {
        res.status(400).send("error saving the user : " + err.message);
    }
});

authRouter.post("/logout", async (req, res) => {

    res.cookie("token", null, {
        expires: new Date(Date.now()),
    });
    res.send("logout successfull!!!!");
});

const frontendURL =
  process.env.NODE_ENV === "production"
    ? "https://codeconnect.shop"
    : "http://localhost:5173";



authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
   
    session: false,
  }),
  async (req, res) => {
    const token = req.user.getJWT();

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true if you're using HTTPS only
      sameSite: "lax",
      expires: new Date(Date.now() + 8 * 3600000),
    });

    const frontendURL =
      process.env.NODE_ENV === "production"
        ? "https://codeconnect.shop"
        : "http://localhost:5173";

    res.redirect(`${frontendURL}/profile`);
  }
);

module.exports = authRouter;