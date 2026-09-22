const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup", { currUser: req.user || null });
};

module.exports.signupRoute = async (req, res, next) => {
    try {
        let { username, email, password } = req.body;
        
        console.log('Signup attempt:', { username, email });
        
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        
        console.log('User registered successfully:', registeredUser.email);
        
        req.login(registeredUser, (err) => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Welcome to Wanderlust!');
            res.redirect('/listings');
        });
        
    } catch (e) {
        console.error('Signup error:', e);
        req.flash("error", e.message);
        res.redirect("/signup");
    }
};

module.exports.rendeLoginForm = (req, res) => {
    res.render("users/login", { currUser: req.user || null });
};

module.exports.login = async (req, res) => {
    console.log('Login controller called');
    console.log('User in login controller:', req.user);
    console.log('Session in login controller:', req.session);
    req.flash("success", "Welcome back to Wanderlust!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    console.log('Redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "you are logged out!!");
        res.redirect("/listings");
    });
};