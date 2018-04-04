
var mongoose = require("mongoose");

var campgroundSchema = mongoose.Schema(
    {
    name: String,
    price: String,
    image: String,
    description: String,
    location: String,
    lat: Number,
    lng: Number,
    createdAt: { type: Date, default: Date.now },
   author: {
        id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
        },
        username: String
   },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "comment"
        }
    ]
});

module.exports = mongoose.model("Campground",campgroundSchema);