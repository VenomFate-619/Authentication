require("dotenv").config();
//  console.log(process.env);
const express=   require("express"),
      bodyParser=require("body-parser"),
      mongoose=  require("mongoose"),
      path=      require("path"),
      app=       express(),
      index=     require("./routes/index"),
      users=     require("./routes/users"),
      dashboard=     require("./routes/dashboard"),
      flash=     require("connect-flash"),
      session=   require("express-session"),
      mongooseStore=require("connect-mongodb-session")(session),
      store=new mongooseStore({
          uri:process.env.mongo_url,
          collection:"sessions"
      });
// Data base Connection
 mongoose.connect(process.env.MONGODB_ADDON_URI,{useNewUrlParser:true,useUnifiedTopology:true},()=>
 {
     console.log("mongo db connected");
 });   
// Automatic HTTPS redirection
// app.use(enforce.HTTPS({ trustProtoHeader: true }))
// use express-session
app.use(session({
    secret:process.env.secret,
    saveUninitialized:false,
    resave:false,
    store:store
}))

// Middleware
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));
app.use(flash());
app.use((req,res,next)=>
{
    res.locals.success_msg=req.flash("success_msg");
    res.locals.error_msg=req.flash("error_msg");
    next();
})
app.set("view engine","ejs"); 
// routes
app.use(index);
app.use(dashboard);
app.use("/users",users);
app.use("/",(req,res,next)=>
{
    res.render("error",{pageTitle:"ERROR"});
})
//Server connection
app.listen(process.env.PORT,()=>
{
    console.log("server get started at port 3000");
})
