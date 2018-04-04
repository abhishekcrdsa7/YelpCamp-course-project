var express= require("express");
var router = express.Router();
var campground = require("../modals/campground");
var comment = require("../modals/comment");
var middleware = require("../middleware/index");
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);



router.get("/", function(req, res){
    campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/index",{campgrounds:allCampgrounds});        
        }
        
    });
});


router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var price = req.body.price;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name,price: price, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated.createdAt);
            res.redirect("/campgrounds");
        }
    });
  });
});



router.get("/new",middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

router.get("/:id",function(req,res){
    campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if(err || !foundCampground){
            req.flash("error","Something went wrong. Please try again.");
            return res.redirect("/campgrounds");
        }else{
            res.render("campgrounds/show",{campground: foundCampground});            
        }
    });
});


router.get("/:id/edit",middleware.checkCampgroundOwnership,function(req, res){
     campground.findById(req.params.id,function(err, foundCampground){
            if(err){
                console.log(err);
            }
            res.render("campgrounds/edit",{campground: foundCampground});
        });
});


router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    console.log(location);
    var newData = req.body.campground;
    newData.lat = lat;
    newData.lng = lng;
    newData.location = location;
    campground.findByIdAndUpdate(req.params.id, newData, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});


router.delete("/:id",middleware.checkCampgroundOwnership, function(req, res){
    campground.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);
        }
        res.redirect("/campgrounds");
    });
});






module.exports = router;