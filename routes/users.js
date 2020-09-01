const express=require("express");
const bcrypt=require("bcrypt");
const router=express.Router();
const User=require("../models/user");
const {body}=require("express-validator");
const {login_get,register_get,register_post,login_post,logout,reset_get,otp_verify, reset_post,new_password,isAuthenticated}=require("../controllers/users");

// Routes
router.get("/login",isAuthenticated,login_get);

router.get("/register",isAuthenticated,register_get);

router.post("/register",
[
   body("name","Name length should be greater than 2")
   .trim()
   .isLength({min:2})
   .isAlphanumeric()
   .withMessage("The name only contain alphabets"),
   body("email")
   .trim()
   .normalizeEmail()
   .isEmail()
   .withMessage("Email you enter is wrong")
   .custom(async (value,{req})=>
   {
       const user=await User.findOne({email:value});
          if(user)
          {
             throw new Error("Email already exist,click here to <a href='/users/login'>Login</a>");
          }
          return true;
          
      }),
   body("contact","Enter the valid contact Number")
   .isNumeric(),   
   body("password","The password length should be greater than 6")
   .trim()
   .isLength({min:6}),
   body("confirm_password")
   .trim()
   .custom((value,{req})=>
   {
       if(value!==req.body.password)
       {
           throw new Error("The password and confirm password doesn't match");
       }
       return true;
   })
]
,register_post);

router.post("/login",
[
    body("password","The password length should be greater than 6")
    .trim()
    .isLength({min:6}),
    body("email","Enter the valid email")
    .trim()
    .normalizeEmail()
    .isEmail()
    .custom(async (value,{req})=>
    {
       const user=await User.findOne({email:value});
       if(!user)
       {
           throw new Error("Your Email is not registered.click here <a href='/users/register'>register</a>")
       }
       const result=await bcrypt.compare(req.body.password,user.hash_password);
       if(!result)
       {
           throw new Error("Password enter is wrong");
       }
       req.session.user=user;
       req.session.login=true;
       return true;
    })
]
,login_post);

router.get("/logout",logout);

router.get("/reset",reset_get);

router.post("/reset",
[
    body("contact","Enter the valid number")
    .isNumeric()
],
reset_post);

router.post("/reset/verify",otp_verify);

router.post("/reset/new_password",new_password);
module.exports=router;