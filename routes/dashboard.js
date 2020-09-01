const {dashboard}=require("../controllers/dashboard");
const express=require("express");
const router=express.Router();
const {is_dashboard_Authenticated}=require("../controllers/users");

router.get("/dashboard",is_dashboard_Authenticated,dashboard);
module.exports=router;
