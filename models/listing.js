const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews.js");
const listingSchema = new Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    image:{
        type:String,
        default:"https://cdn-icons-png.flaticon.com/512/9816/9816583.png",
        set: (v) => v === "" 
        ? "https://cdn-icons-png.flaticon.com/512/9816/9816583.png" 
        : v,
    },
    price: Number,
    location: String,
    country: String,
    reviews: [
     {
        type: Schema.Types.ObjectId,
        ref: "Review",
     }
]
});

listingSchema.post("findOneAndDelete", async(listing) =>{
    if(listing) {
        await Review.deleteMany({_id : {$in: listing.reviews}});
    }
});

const Listing = mongoose.model("Listing", listingSchema);

module.exports = Listing;