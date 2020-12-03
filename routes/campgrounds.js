var methodOverride = require('method-override');
var express = require('express');
var sanitizer = require('express-sanitizer');
var Campground = require('../models/campground');
var router = express.Router({ mergeParams: true });
router.use(sanitizer());
router.use(methodOverride('_method'));

//============
//ROUTES
//============

//HOME PAGE 

router.get('/', function (req, res) {
    res.render('campgrounds/landing');
});

//ADDING NEW CAMPGORUND 

router.get('/campgrounds/new', isLoggedin, function (req, res) {
    res.render('campgrounds/new');
});

//COAMPGROUND ADDED TO DB

router.post('/campgrounds', isLoggedin, function (req, res) {

    var name = req.sanitize(req.body.campgroundName);
    var image = req.sanitize(req.body.campgroundUrl);
    var description = req.sanitize(req.body.description);
    var author = req.sanitize(req.user.username);
    var newCampground = { name: name, url: image, description: description, author: author };
    Campground.create(newCampground, function (err, newCampground) {
        if (err) {
            req.flash("error", "Some error occured!");
            console.log(err);

        }
        else {
            req.flash("success", "Campground added!");
            res.redirect('/campgrounds');
        }
    });
});

//SHOWING ALL CAMPGROUNDS

router.get('/campgrounds', function (req, res) {
    Campground.find({}, function (err, campground) {
        if (err) {

            req.flash("error", "Some error occured!");
        }
        else {

            res.render('campgrounds/campground', { campgrounds: campground });
        }
    });
});

//INFO OF CAMPGROUND

router.get('/campgrounds/:id', isLoggedin, function (req, res) {
    Campground.findById(req.params.id).populate("comments").exec(function (err, returnedId) {
        if (err) {
            req.flash("error", "Campground not found!");
        }
        else {

            res.render('campgrounds/info', { id: returnedId });
        }
    });
});

//EDIT CAMPGROUND

router.get('/campgrounds/:id/edit', checkUserOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            req.flash("error", "Campground not found!");
            res.redirect('/campgrounds');
        }
        else {

            res.render('campgrounds/edit', { campground: campground });
        }
    });
});

//UPDATE CAMPGROUND

router.put('/campgrounds/:id', checkUserOwnership, function (req, res) {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function (err, updatedCampground) {
        if (err) {
            req.flash("error", "Campground not found!");
        }
        res.redirect('/campgrounds/' + updatedCampground._id);
    });
});

//DELETE CAMPGROUND

router.delete('/campgrounds/:id', checkUserOwnership, function (req, res) {
    Campground.findByIdAndDelete(req.params.id, function (err, deletedCampground) {
        if (err) {
            console.log(err);
            req.flash("error", "Campground not found!");
            res.redirect('/campgrounds');
        }
        else {
            req.flash("success", "Campground deleted!");
            res.redirect('/campgrounds');
        }
    });
});

//================================
//ALL MIDDLEWARE USED IN THIS FILE
//================================

//USER AUTHENTICATION

function checkUserOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function (err, campground) {
            if (err) {
                console.log(err);
                req.flash("error", "Campground not found!");
                res.redirect('back');
            }
            else {
                console.log(campground);
                if (campground.author === req.user.username)
                    next();
                else {
                    req.flash("error", "Some error occured!");
                    res.redirect('back');
                }

            }
        });
    }
    else {
        res.redirect('back');
    }
}

//COMMENT AUTHENTICATION

function checkCommentOwnership(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, comment) {
            if (err) {
                console.log(err);
                req.flash("error", "Commnet not found!");
                res.redirect('back');
            }
            else {
                console.log(comment);
                if (comment.author === req.user.username)
                    next();
                else {
                    req.flash("error", "Some error occured!");
                    res.redirect('back');
                }
            }
        });
    }
    else {
        res.redirect('back');
    }
}

//USER IS LOGGED IN OR NOT

function isLoggedin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You must Logged in!");
    res.redirect('/login');
}
module.exports = router;
