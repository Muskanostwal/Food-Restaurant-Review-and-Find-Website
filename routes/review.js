const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js"); //JOI SCHEMA OF REVIEW
const Listing = require("../models/listing.js");
const Review = require("../models/reviews.js");


//VALIDATE REVIEW FUNCTION
const validateReview = (req,res,next) =>{
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
}

//POST REVIEWS ROUTE
router.post(
    "/",
    validateReview,
    wrapAsync(async(req,res) =>{
        let listing = await Listing.findById(req.params.id);
        if (!listing) {
            throw new ExpressError(404, "Listing not found");
        }
        let newReview = new Review(req.body.review);
        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();
        req.flash("success","New Review Created successfully");
        res.redirect(`/listings/${listing._id}`);
    }    
));

//DELETE REVIEW ROUTE
router.delete("/:reviewId", 
    wrapAsync(async (req, res) => {
        let { id, reviewId } = req.params;
        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        req.flash("success","Review Deleted Successfully");
        res.redirect(`/listings/${id}`);
    })
);


module.exports = router;