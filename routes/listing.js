const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../schema.js"); //JOI SCHEMA OF LISTING
const Listing = require("../models/listing.js");


//VALIDATE LISTING FUNCTION
const validateListing = (req,res,next) =>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400,errMsg);
    }else{
        next();
    }
};

//INDEX ROUTE
router.get("/",
    wrapAsync(async(req,res)=>{
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{ allListings });
}));

//NEW ROUTE
router.get("/new",
    wrapAsync((req,res)=>{
    res.render("listings/new.ejs");
}));

//CREATE ROUTE
router.post("/",
    validateListing,
    wrapAsync(async(req,res, next)=>{
    // let {title,description,image,price,location,country} = req.body; //this is the normal and same way which we done till now but now we will see the easier way by creating the key-value pair like this listing[title] in new.ejs
      const newListing = new Listing(req.body.listing); //we will get an instance
      await newListing.save();
      req.flash("success","New Listing Created");
      res.redirect("/listings");
    })
);

//SHOW ROUTE
router.get("/:id",
    wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    if(!listing){
        req.flash("error","Listing Not exists");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs",{listing});
}));

//EDIT ROUTE
router.get("/:id/edit", 
    wrapAsync(async(req,res)=>{
    let {id} =req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Listing Not exists");
        res.redirect("/listings");
    }
    res.render("listings/edit.ejs",{listing});
}));

//UPDATE ROUTE
router.put("/:id",
    validateListing,
    wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash("success","Listing Edited Successfully");
    res.redirect("/listings");
}));

//DELETE ROUTE
router.delete(
    "/:id",
    wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success","Listing Deleted Successfully");
    console.log(deletedListing);
    res.redirect("/listings");
}));

module.exports = router;

