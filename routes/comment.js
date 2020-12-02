var express = require('express');
var Comment = require('../models/comment');
var Campground = require('../models/campground');
var sanitizer = require('express-sanitizer');
var router = express.Router({ mergeParams: true });

//var middleWare = require('../middleware');

router.use(sanitizer());

//================
//ROUTES
//================

//NEW COMMENT TEMPLATE ROUTE

router.get("/campgrounds/:id/comments/new", isLoggedin, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            req.flash("error", "Campground not found!");
            console.log(err);
        }
        else {
            res.render('comments/new', { campground: campground });
        }
    });

});

//COMMENT ADDED TO DB

router.post('/campgrounds/:id/comments', isLoggedin, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            console.log(err);
            req.flash("error", "Campground not found!");
            res.redirect('/campgrounds');
        }
        else {
            req.body.campground.author = req.user.username;
            Comment.create(req.body.campground, function (err, comment) {
                if (err) {
                    console.log(err);
                    req.flash("error", "Some error occured.");
                    res.redirect('/campgrounds');
                }
                else {
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Comment added.");
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});

//EDIT COMMENT ROUTE

router.get('/campgrounds/:campground_id/comments/:comment_id/edit', checkCommentOwenership, function (req, res) {
    Comment.findById(req.params.comment_id, function (err, foundComment) {
        if (err) {
            req.flash("error", "Comment not found!");
            res.redirect("back");
        }
        else {
            res.render('comments/edit', { campground_id: req.params.campground_id, comment: foundComment });
        }
    });
});

//UPDATE COMMENT ROUTE

router.put('/campgrounds/comments/:comment_id', checkCommentOwenership, function (req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function (err, updatedComment) {
        if (err) {
            console.log(err);
            req.flash("error", "Can not modify your comment!");
            res.redirect("back");
        }
        else {
            req.flash("success", "Comment modified!");
            res.redirect('/campgrounds');
        }
    });

});

//DELETE COMMENT ROUTE

router.delete('/campgrounds/:campground_id/comments/:comment_id', checkCommentOwenership, function (req, res) {
    Comment.findByIdAndDelete(req.params.comment_id, function (err, deletedComment) {
        if (err) {
            console.log(err);
            req.flash("error", "Can not delete comment!");
            res.redirect("back");
        }
        else {
            req.flash("success", "Comment deleted!");
            Campground.findById(req.params.campground_id, function(err, campFound){
                if(err){
                    req.flash('error', 'Something went wrong');
                    res.redirect(`back`);
                    }
                else{
                    for(var i = 0; i < campFound.comments.length; i++){
                        if(campFound.comments[i].equals(deletedComment._id)){
                            campFound.comments.splice(i, 1);
                            campFound.save();
                        }
                    }
                }
            });
            res.redirect('/campgrounds/' + req.params.campground_id);
        }
    });
});

//================================
//ALL MIDDLEWARE USED IN THIS FILE
//================================

//FUNCTION FOR CHECK USER AUTHENTICATION

function checkUserOwenership(req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function (err, campground) {
            if (err) {
                console.log(err);
                req.flash("error", "Campground not found!");
                res.redirect('back');
            }
            else {

                if (campground.author === req.user.username)
                    next();
                else
                    res.redirect('back');
            }
        });
    }
    else {
        res.redirect('back');
    }
}


//FUNCTION TO CHECK COMMENT AUTHOR

function checkCommentOwenership(req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, comment) {
            if (err) {
                console.log(err);
                if(comment === null){
                    req.flash('error', 'Comment not found');
                    res.redirect('/campgrounds/'+ req.params.campground_id);
                } 
                req.flash("error", "Comment not found!");
                res.redirect('back');
            }
            else if(comment.author === req.user.username)
                    next();
                else
                    res.redirect('back');
            }
        });
    }
    else {
        res.redirect('back');
    }
}

//FUNCTION TO CHECK USER IS LOGGED IN OR NOT

function isLoggedin(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    req.flash("error", "You must Logged in.");
    res.redirect('/login');
}

module.exports = router;

