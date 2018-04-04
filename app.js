var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var campground = require("./modals/campground");
var comment = require("./modals/comment");
var seedDB = require("./modals/seeds.js");
var passport = require("passport");
var localStrategy = require("passport-local");
var user = require("./modals/user");
var campgroundsRoutes = require("./routes/campground");
var indexRoutes = require("./routes/index");
var commentsRoutes = require("./routes/comment");
var methodOverride = require("method-override");
var flash = require("connect-flash");



mongoose.connect("mongodb://localhost/camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(require("express-session")({
    secret: "Real Midrid was the best is the best and will be the best",
    resave: false,
    saveUninitialized:  false
}));




app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());
app.use(function(req,res,next){
    res.locals.moment = require("moment");
    res.locals.user = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use("/campgrounds",campgroundsRoutes);
app.use("/campgrounds/:id",commentsRoutes);
app.use(indexRoutes);

app.get("/", function(req, res){
    res.render("landing");
});





    



app.listen(process.env.PORT, process.env.IP, function(){
   console.log("The YelpCamp Server Has Started!");
});