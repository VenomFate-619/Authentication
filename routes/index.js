const express=require("express");
const router=express.Router();
const index=require("../controllers/index");
const {isAuthenticated}=require("../controllers/users");

// Routes
router.get("/",isAuthenticated,index);
module.exports=router;