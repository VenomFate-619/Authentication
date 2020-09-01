const mongoose =require("mongoose");
const userSchema=new mongoose.Schema(
    {
        name:{type:String},
        email:{type:String},
        hash_password:{type:String},
        password_otp:{type:Number},
        otp_expired:{type:Date},
        contact:{type:String}
        
    }
);
const User=mongoose.model("user",userSchema);
module.exports=User;