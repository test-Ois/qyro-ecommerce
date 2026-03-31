const ApiError = require("../utils/apiError");

module.exports = (req,res,next)=>{

 // SECURITY: Verify user object exists
 if(!req.user){
  throw new ApiError(401, "User not authenticated");
 }

 if(req.user.role !== "admin"){
  throw new ApiError(403, "Access denied - admin privileges required");
 }

 next();

};