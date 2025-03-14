const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path"); //setting ejs by creating views folder
const MONGO_URL = "mongodb://127.0.0.1:27017/ZoMyTo";
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");


main()
.then(()=>{
    console.log("connected to mongodb");
}).catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(MONGO_URL);
}; 


app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({ extended:true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


const sessionOptions = {
    secret: "mySuperScretCode",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7*24*60*60*1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    }
};

app.get("/",(req,res)=>{
    res.send("working route");
});

app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);
//ERROR HANDLER MIDDLEWARES
//this will first check all the routes , if didn't match to any then will send this error
app.all("*", (req,res,next) =>{
    next(new ExpressError(404,"Page not Found"));
});

//catches the error
app.use((err, req, res, next)=>{
    let{statusCode=500, message="Something went wrong"} =err;//if nothing is assigned thent hese will show
    res.status(statusCode).render("error.ejs",{ message });
    // res.status(statusCode).send(message);
});

app.listen(8080, ()=>{
    console.log("listening to port 8080");
});
