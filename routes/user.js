const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
const userController = require("../controllers/user.js");

router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signupRoute));

router.route("/login")
    .get(userController.rendeLoginForm)
    .post((req, res, next) => {
        console.log('Login POST request received');
        console.log('Request body:', req.body);
        console.log('Session before auth:', req.session);
        next();
    }, saveRedirectUrl,
        passport.authenticate('local', {
            failureRedirect: '/login',
            failureFlash: true
        }), (req, res, next) => {
        console.log('Authentication successful');
        console.log('User after auth:', req.user);
        console.log('Session after auth:', req.session);
        next();
    }, userController.login);

router.get("/logout", userController.logout);

module.exports = router;