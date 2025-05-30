import jwt from "jsonwebtoken";



function validateTokenManager(req,res,next){
    try {
        const { token } = req.cookies;

        if(!token) throw new Error("Token not exist");
         
       const decode = jwt.verify(token,process.env.JWT_SECRET_MANAGER);

       if(!decode) throw new Error("Token Not Valid");

       req.user = decode;
       next();

        
    } catch (error) {
       console.log(error);
       res.status(401).json({success:false,error:error.message})
    }
}

export default validateTokenManager;
