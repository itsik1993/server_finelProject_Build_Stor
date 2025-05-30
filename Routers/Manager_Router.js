import {Router} from "express"
import queries from "../Controllers/Manager_Controllers.js"
import validateTokenManager from "../middelware/ValidatTokenManager_Middelware.js"


const router = Router();
const {Login,Register,authenticate,logout,forgotPassword,resetPassword,getallmanagers} = queries;


// Login
router.post("/Login", Login);
// Register
router.post("/Register", Register);
// Authenticate
router.get("/auth", validateTokenManager,authenticate);
// router.post("/נק הקצה לדוגמא addproduct", "הפונקצה ")


router.get("/logout", logout)

// Password Reset
router.post("/manager/forgotPassword", forgotPassword);
router.post("/manager//resetPassword", resetPassword);

router.get("/getAllManagers", getallmanagers)


export default router;
