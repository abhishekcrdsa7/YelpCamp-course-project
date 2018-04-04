//======================================
var express= require("express");
var router = express.Router({mergeParams: true});
var campground = require("../modals/campground");
var comment = require("../modals/comment");
var middleware = require("../middleware/index");
router.get("/comments/new",middleware.isLoggedIn,function(req,res){
    campground.findById(req.params.id,function(err, campground){
        if(err){
            console.log(err);
        }else{
            res.render("comments/new",{campground: campground});        
        }
    });
});


router.post("/comments",middleware.isLoggedIn,function(req, res){
    campground.findById(req.params.id,function(err, campground){
        if(err){
            console.log(err);
        }else{
            comment.create(req.body.comment, function(err, comment){
                if(err){
                    console.log(err);
                }else{
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment._id);
                    campground.save();
                    res.redirect("/campgrounds/"+campground._id);
                }
            });
        }
    });
});


router.get("/comments/:comment_id/edit",middleware.checkCommentOwnership, function(req, res){
    comment.findById(req.params.comment_id, function(err, foundComment){
        if(err){
            console.log(err);
        }else{
            res.render("../views/comments/edit",{campground_id: req.params.id, comment: foundComment});    
        }
        
    });
    
});


router.put("/comments/:comment_id",middleware.checkCommentOwnership, function(req, res){
     if(req.isAuthenticated()){
    var updateComment = req.body.comment;
    comment.findByIdAndUpdate(req.params.comment_id,updateComment, function(err, comment){
        if(err){
            console.log(err);
        }else{
           
            comment.author.id = req.user._id;
            comment.author.username = req.user.username;
            comment.save();
            res.redirect("/campgrounds/"+req.params.id);
            
        }
       
    });
     }else{
            res.redirect("back");
        }
});

router.delete("/comments/:comment_id",middleware.checkCommentOwnership, function(req, res){
    comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err){
            console.log(err);
        }
        res.redirect("/campgrounds/"+req.params.id);
    })
});





module.exports = router;