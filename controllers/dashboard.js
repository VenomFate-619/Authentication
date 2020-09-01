module.exports.dashboard=(req,res,next)=>
{
    res.render("dashboard",{
        pageTitle:"Dashboard",
        name:req.session.user.name,
        error_msg_validate:[]
    });
} 