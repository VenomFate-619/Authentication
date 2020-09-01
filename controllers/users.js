require("dotenv").config();
const User=require("../models/user");
const {validationResult, body}=require("express-validator")
const crypto=require("crypto");
const bcrypt=require("bcrypt");
const { getMaxListeners } = require("../models/user");
const client = require('twilio')(process.env.accountSid, process.env.authToken);


module.exports.login_get=(req,res,next)=>
{
    res.render("login",{ 
    pageTitle:"login Page",
    field:{
        email:"",
        password:""
    },
    error_msg_validate:[],
    validation:[]
})
}


module.exports.register_get=(req,res,next)=>
{
    res.render("register",{
    pageTitle:"Register Page",
    field:{
        name:"",
        email:"",
        password:"",
        confirm_password:""
          },
        validation:[],
        error_msg_validate:[]   
    });
}


 module.exports.register_post=(req,res,next) =>
{
    const errors=validationResult(req)
            console.log(errors.array());
            if(!errors.isEmpty())
            {
                res.status(422).render("register",{
                    pageTitle:"Register Page",
                    field:{
                        name:req.body.name,
                        email:req.body.email,
                        password:req.body.password,
                        confirm_password:req.body.confirm_password
                    },
                    error_msg_validate:errors.array().map(error=>error.msg),
                    validation:errors.array().map(error=>error.param)
                })
            }
            else
            {
                 bcrypt.genSalt(10,(err,salt)=>
                 {
                    bcrypt.hash(req.body.password,salt,(err,hash)=>
                    {
                        User.create({
                            name:req.body.name,
                            email:req.body.email,
                            contact:"+91"+req.body.contact,
                            hash_password:hash
                        })
                        .then(()=>
                        {
                            req.flash("success_msg","Register Suceesful");
                            res.redirect("/users/login");
                        })
                        .catch(()=>
                       {
                           req.flash("error_msg","Register Failed Try Again");
                           res.redirect("/users/register");
                        })
                        
                    })
                 });
        
             }
            }
module.exports.login_post=(req,res,next)=>
{
    const errors=validationResult(req);
    if(!errors.isEmpty())
    {
        res.status(422).render("login",{
            pageTitle:"login Page",
            field:{
                email:req.body.email,
                password:req.body.password
            },
            error_msg_validate:errors.array().map(error=>error.msg),
            validation:errors.array().map(error=>error.param)
        })
    }
      else
      {
        req.session.save(()=>
        {
           res.redirect("/dashboard");
        })
      }
    }
     
module.exports.logout=(req,res,next)=>
{
    req.flash("success_msg","You are logout sucessfully ");
    req.session.user=undefined;
    req.session.login=undefined;
    res.redirect("/users/login");
}


module.exports.is_dashboard_Authenticated=(req,res,next)=>
{
    if(req.session.login)
    {
        next();
    }
    else
    {
        req.flash("error_msg","You are not login");
        res.redirect("/users/login");
    }
}

module.exports.isAuthenticated=(req,res,next)=>
{
    if(req.session.login)
    {
        res.redirect("/dashboard");
    }
    else
    {
        next();
    }
}

module.exports.reset_get=(req,res,next)=>
{
    res.render("contact",{
        pageTitle:"Contact",
        field:{
            contact:""
        },
        error_msg_validate:[],
        validation:[]
    })
}


module.exports.reset_post=(req,res,next)=>
{
    const errors=validationResult(req);
    if(!errors.isEmpty())
    {
       res.render("contact",{
           pageTitle:"Contact",
           field:{
            contact:req.body.contact
        },
        error_msg_validate:errors.array().map(error=>error.msg),
        validation:errors.array().map(error=>error.param)
       })
    }
    else
    {
    User.findOne({contact:"+91"+req.body.contact},(err,user)=>
    {
        if(!user)
        {
          req.flash("error_msg","Your Contact is not registered.click here <a href='/users/register'>register</a>");
          res.redirect("/users/reset");
        }
        else
        {
           const otp=Math.floor((Math.random()*100000)+100000);
           User.findById(user._id)
           .then(user=>
            {
              if(!user)
              {
                req.flash("error_msg","Your Contact is not registered.click here <a href='/users/register'>register</a>");
                res.redirect("/users/reset");
              }
              else
              {
                user.password_otp=otp;
                user.otp_expired=Date.now()+(1000*60*3);
                user.save()
                .then((user)=>
                {
                    client.messages
                    .create({
                        body: `Your OTP for Reseting password is ${otp}`,
                        from: '+12025176035',
                        to: '+91'+req.body.contact
                    },(err,info)=>
                    {
                         if(err)
                         {
                             console.log(err)
                         }
                         else
                         {
                             console.log(info);
                            res.render("otp",{
                                pageTitle:"Verify",
                                _id:user._id.toString(),
                                error_msg_validate:[]
                            })
                         }
                    })
                })
                .catch((err)=>
                {
                    req.flash("error_msg","OOPS, Something went wrong , Try Again");
                    res.redirect("/users/reset");
                })
              }
            })
           .catch(err=>
            {
                req.flash("error_msg","OOPS, Something went wrong , Try Again");
                 res.redirect("/users/reset");
            }) 
        }    
})
}
}


module.exports.otp_verify=(req,res,next)=>
{
    User.findOne({_id:req.body._id,password_otp:Number(req.body.otp)})
    .then(user=>
        {
           if(!user)
           {
               res.render("otp",{
                pageTitle:"Verify",
                _id:req.body._id.toString(),
                error_msg_validate:["OTP you enter is incorrect,Try again"]
            })   
           }
           else
           {
              User.findOne({_id:user._id,otp_expired:{$gt:Date.now()}})
              .then(user=>
                {
                  if(!user)
                 {
                    res.render("otp",{
                     pageTitle:"Verify",
                     _id:req.body._id.toString(),
                     error_msg_validate:["Your Otp is Expired <a href='/users/reset'>Try again</a>"]
                 })   
                  }
                  else
                  {
                      res.render("password",{
                          pageTitle:"Reset Password",
                          _id:user._id,
                          error_msg_validate:[]
                      })
                  }
                })
              .catch(err=>
                {
                    res.render("otp",{
                        pageTitle:"Verify",
                        _id:req.body._id.toString(),
                        error_msg_validate:["OOPS, Something went wrong , Try Again"]
       
                })  
                })
            }
        })
    .catch(err=>
        {
               res.render("otp",{
                pageTitle:"Verify",
                _id:req.body._id.toString(),
                error_msg_validate:["OOPS, Something went wrong , Try Again"]
        })    
})
}

module.exports.new_password=(req,res,next)=>
{
    User.findOne({_id:req.body._id})
    .then(user=>
        {
            if(!user)
            {
                req.flash("error_msg","Your session is expired");
                res.redirect("/users/reset");
            }
            else
            {
           if(req.body.password!==req.body.confirm_password)
           {
               res.render("password",{
                pageTitle:"Reset Password",
                _id:user._id,
                error_msg_validate:["Password and confirm Password does not match"]
               })
           }
           else
           {
               bcrypt.genSalt(10,(err,salt)=>
               {
                   if(err)
                   {
                    res.render("error",{
                        pageTitle:"error",
                        error_msg_validate:[]
                    });
                   }
                   else
                   {
                       bcrypt.hash(req.body.password,salt,(err,hash)=>
                       {
                           if(err)
                           {
                            res.render("error",{
                                pageTitle:"error",
                                error_msg_validate:[]
                            });
                           }
                           else
                           {
                            user.hash_password=hash;
                            user.save((err,user)=>
                           {
                               if(err)
                               {
                                res.render("error",{
                                    pageTitle:"error",
                                    error_msg_validate:[]
                                });
                               }
                               else
                               {
                                   req.flash("success_msg","Password changes succesfully");
                                   res.redirect("/users/login");
                               }
                           })
                           }
                       })
                   }
               })
           }
        }
        })
    .catch(err=>
        {
            res.render("error",{
                pageTitle:"error",
                error_msg_validate:[]
            });
        })    
}
