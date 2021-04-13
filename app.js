var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var express = require('express');
var app = express();
var passport = require('passport');
var LocalStrategy = require('passport-local');
var bodyParser = require('body-parser');
var sanitizer = require('express-sanitizer');
var methodOverride = require('method-override');
var User = require('./models/user');
var Campground = require('./models/campground');
var Comment = require('./models/comment');
var commentRoutes = require('./routes/comment');
var campgroundRoutes = require('./routes/campgrounds');
var indexRoutes = require('./routes/index');
var flash = require('connect-flash');
var dburl = process.env.DBURL;


app.use(require('express-session')({
    secret: "yoursessionsecretstring",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
mongoose.set('useFindAndModify', false);
app.use(campgroundRoutes);
app.use(commentRoutes);
app.use(indexRoutes);
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
mongoose.connect(dburl,{useNewUrlParser: true, useUnifiedTopology: true});

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.listen(port, function () {
    console.log('Server started at port '+port);
});
