var comment = require("../modals/comment");
var campground = require("../modals/campground");
var user = require("../modals/user");
var middleware = {};
middleware.isLoggedIn = function (req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error","You must be logged in");
    res.redirect("/login");
}

middleware.checkCommentOwnership = function (req, res ,next){
    if(req.isAuthenticated()){
        comment.findById(req.params.comment_id,function(err, foundComment){
            
            if(err || !foundComment){
                req.flash("error","Something went wrong. Please try again." );
                return res.redirect("/campgrounds");
            }
            if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
               next();
            }else{
                req.flash("error","You are not authorised to use this function");
                res.redirect("back");
            }
        });
    }else{
        res.redirect("back");
    }    
}

middleware.checkCampgroundOwnership =  function (req, res ,next){
    if(req.isAuthenticated()){
        campground.findById(req.params.id,function(err, foundCampground){
            
            if(err || !foundCampground){
               req.flash("error","Something went wrong. Please try again.");
               return res.redirect("/campgrounds");
            }
            if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
               next();
            }else{
                req.flash("error","You are not authorised to use this function");
                res.redirect("back");
            }
        });
    }else{
        req.flash("error","You must be logged in");
        res.redirect("back");
    }    
}

module.exports = middleware;