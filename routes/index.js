//===========================================
//authroutes
var express= require("express");
var router = express.Router();
var passport = require("passport");
var user = require("../modals/user");
var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");



router.get("/register",function(req, res){
    res.render("register");
    
});

router.post("/register",function(req,res){
    user.register(new user({username: req.body.username, email: req.body.email}),req.body.password,function(err,newUser){
        if(err){
            req.flash("error",err.message);
            res.redirect("/register");
            return;
        }
         passport.authenticate("local")(req,res, function(){
             req.flash("success","You are now successfully registered. Enjoy your time with us.");
             res.redirect("/campgrounds");
        });
    });
    });
    
router.get("/login",function(req,res){
    res.render("login");
});

router.post("/login",passport.authenticate("local",{
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}),function(req,res){});

router.get("/logout",function(req,res){
    req.logout();
    req.flash("success", "Successfully logged you out");
    res.redirect("/campgrounds");
});


router.get("/forgot",function(req, res){
    res.render("forgot");
});

router.post("/forgot",function(req, res, next){
    async.waterfall([
        function(done) {
          crypto.randomBytes(20, function(err, buff){
              var token = buff.toString('hex');
              done(err, token);
          });        
        },
        
        function(token, done){
            user.findOne({email: req.body.email}, function(err, user){
                if(!user || err){
                    req.flash("error", "No user with the specified email address exists.");
                    return res.redirect("/forgot");
                }
                
                user.resetPasswordToken =  token;
                user.resetPasswordExpire = Date.now() + 3600000;
                user.save(function(err){
                    done(err, token, user);
                });
            });
        },
        function(token, user, done){
            var smtptransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                 user: "abhishekcrdsa7@gmail.com",
                 pass: process.env.GMAILPW
                }
                });
                
                
            var mailOptions = {
                to: user.email,
                from: "abhishekcrdsa7@gmail.com",
                subject: "Yelpcamp Password Reset",
                text: "You requested to reset your password.\n"
                +"To reset please visit the following link\n"
                +"http://"+req.headers.host+ "/reset/" + token +"\n"
            }
            smtptransport.sendMail(mailOptions, function(err){
                req.flash(
                    "success", 
                    "The mail with the link to reset your password has been sent to your mail address. The link will be valid for 1 hour only"
                    );
                done(err, 'done');
            });
        },
        ],
        function(err){
            if(err){
                return next(err);
            }
            res.redirect("/forgot");
        });
        
});

router.get("/reset/:token",function(req, res){
    user.findOne({resetPasswordToken: req.params.token, resetPasswordExpire: {$gt: Date.now()}}, function(err, user){
        if(!user || err){
            req.flash("error", "The token value is wrong or the token has expired.");
            return res.redirect("/forgot");
        }
        res.render("reset",{token: req.params.token});
    });
    
});

router.post("/reset/:token", function(req, res){
    async.waterfall([
            function(done){
                
                   user.findOne({resetPasswordToken: req.params.token, resetPasswordExpire: {$gt: Date.now()}}, function(err, user){
                if(!user || err){
                    req.flash("error" , "Something went wrong. Please try again.");
                    return res.redirect("/forgot");
                }
                if(req.body.password === req.body.confirmpassword){
                    user.setPassword(req.body.password, function(err){
                        if(err){
                            console.log(err);
                            return;
                        }
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpire = undefined;
                        user.save(function(err){
                         if(err){
                            console.log(err);
                            return;
                        }   
                            req.logIn(user, function(err){
                               done(err, user); 
                            });
                        });
                    });    
                }else{
                    req.flash("error", "Passwords dont match.");
                    return res.redirect("back");
                }
            }); 
        },
        function(user, done){
            var smtptransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                 user: "abhishekcrdsa7@gmail.com",
                 pass: process.env.GMAILPW
                }
                });
                
                
            var mailOptions = {
               to: user.email,
               from: "abhishekcrdsa7@gmail.com",
               subject: "Yelpcamp Password Reset",
               text: "Your password was successfully changed",
            };
            
            smtptransport.sendMail(mailOptions,function(err){
                console.log("mail sent");
                req.flash(
                    "success", 
                    "Your password was successfully changed"
                    );
                done(err);
            });
        }
        
    ],function(err){
        if(err){
            req.flash("error", "There was an error. Please try again.");
            return res.redirect("/forgot");
        }
        res.redirect("/campgrounds");
    });
});


module.exports = router;