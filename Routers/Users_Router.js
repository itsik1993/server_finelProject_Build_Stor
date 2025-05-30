import {Router} from "express"
import queries from   "../Controllers/User_Controllers.js"
import validateToken from "../middelware/ValidatToken_Middelware.js"



const router = Router();

const{Register ,verifyEmail,Login ,signWithGoogle,authenticate,logout,forgotPassword,resetPassword,getallusers,setShoppingCart,updateUser,
    updateUserOrder,updateProfileWith_No_mail,updateProfileWithMail,AddToishList,getuser,RemoveFromWishList,ContactUs
} = queries;



// Register 
router.post("/Register", Register);
router.get("/verify-email", verifyEmail)

// Login
router.post("/Login", Login);
router.post("/Sign-with-google", signWithGoogle)

// Authenticate
router.get("/auth", validateToken, authenticate)

router.get("/logout", logout)

// Password Reset
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);

router.get("/getAllUsers", getallusers)
router.get("/getuser/:id",getuser ) 


router.post("/setShoppingCart/:id",setShoppingCart)

router.post("/updateUser/:id",updateUser ) 
router.post("/updateUser_Order/:id",updateUserOrder ) 
router.post("/updateUserProfile_No_Mail/:id",updateProfileWith_No_mail ) 
router.post("/updateUserProfile_With_Mail/:id",updateProfileWithMail ) 
router.post("/AddToishList/:id",AddToishList)
router.post("/RemoveFromWishList/:id",RemoveFromWishList)
router.post("/SendEmailFromContact",ContactUs)


export default router;