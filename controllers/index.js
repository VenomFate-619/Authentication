const index=(req,res,next)=>
{
    res.render("welcome",{
        pageTitle:"Home Page",
        error_msg_validate:[]
    });
}
module.exports=index;
