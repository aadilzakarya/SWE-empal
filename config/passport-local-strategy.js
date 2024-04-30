const passport = require('passport'); //requiring passport
const LocalStrategy = require('passport-local').Strategy; //passport local strategy is used
const User = require('../models/user'); //user schema is needed to authenticate the user

//authentication using passport local
passport.use(new LocalStrategy({
    usernameField : 'email', //the unique key which is used to authenticate in our case it is email
    passReqToCallback : true
}, async function(req, email, password, done) {
    try {
        // Find a user and establish the identity
        const user = await User.findOne({ email: email });

        if (!user || user.password != password) {
            req.flash('error', 'Invalid Username/Password');
            return done(null, false); // authentication not done --> user not found
        }

        return done(null, user); // authentication done --> user found
    } catch (err) {
        req.flash('error', err.message || 'An error occurred');
        return done(err);
    }
}));


//serializing the user to decide which key is to be kept in the cookie
passport.serializeUser(function(user, done){
    done(null, user.id); //encrypts the user id in the session cookie
});

//desirializing the user from key in cookie
passport.deserializeUser(async function(id, done) {
    try {
        // Find the user by id
        const user = await User.findById(id);

        if (!user) {
            console.log('User not found');
            return done(null, false);
        }

        return done(null, user);
    } catch (err) {
        console.log('Error in finding the user -> Passport:', err);
        return done(err);
    }
});


//check if the user is authenticated 
passport.checkAuthentication = function(req, res, next){
    //if the user is signed in then pass on the request to the next function
    if(req.isAuthenticated()){
        return next();
    }

    //if the user is not signed in
    return res.redirect('/users/sign-in');
}

passport.setAuthenticatedUser = function(req, res, next){
    if(req.isAuthenticated()){
        //req.user contains the current user from the signed in cookie and we are just sending it to the locals for the views
        res.locals.user = req.user;
    }
    next();
}
module.exports = passport;