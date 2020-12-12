var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
router.get('/register', function (req, res) {
    res.render('register');
});

//================
//ROUTES
//================

//SIGNUP LOGIC

router.post('/register', function (req, res) {
    var newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            req.flash("error", "Username already exists.");
            res.redirect('/register');
        }
        else {
            passport.authenticate('local')(req, res, function () {
                req.flash("success", "Welcome to Yelp Camp " + user.username);
                res.redirect('/campgrounds');
            });
        }
    });
});


//LOGIN ROUTE

router.get('/login', function (req, res) {
    res.render('login');
});

//LOGIN AUTHENTICATION

router.post('/login', passport.authenticate("local",
    {
        successRedirect: '/campgrounds',
        failureRedirect: '/login',
        failureFlash:true,
        successFlash:true
    }),
    function (req, res) {
    });

//LOGOUT USER

router.get('/logout', isLoggedin, function (req, res) {
    req.logOut();
    req.flash("success", "Successfully Logged Out.");
    res.redirect('/');
});


//================================
//ALL MIDDLEWARE USED IN THIS FILE
//================================

// CHECK USER IS LOGGED IN OR NOT

function isLoggedin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You must Logged in.");
    res.redirect('/login');

}
module.exports = router;
