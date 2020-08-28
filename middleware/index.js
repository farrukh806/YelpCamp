//all middleware goes here
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var middlewareObj = {};

middlewareObj = {
    checkUserOwenership: function (req, res, next) {
        if (req.isAuthenticated()) {
            Campground.findById(req.params.id, function (err, campground) {
                if (err) {
                    console.log(err);
                    res.redirect('back');
                }
                else {
                    console.log(campground);
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
    },
    checkCommentOwenership: function (req, res, next) {
        if (req.isAuthenticated()) {
            Comment.findById(req.params.comment_id, function (err, comment) {
                if (err) {
                    console.log(err);
                    res.redirect('back');
                }
                else {
                    console.log(comment);
                    if (comment.author === req.user.username)
                        next();
                    else
                        res.redirect('back');
                }
            });
        }
        else {
            res.redirect('back');
        }
    },
    isLoggedin: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/login');
    }
};



module.exports = middlewareObj;