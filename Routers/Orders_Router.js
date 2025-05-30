import {Router} from "express"
import queries from "../Controllers/Orders_Controllers.js"


const router = Router();
//להכניס את הפונציות מתוך הקונטרולר
const {CreateNewOrder,getallorders,updateStatus} = queries;


// router.get("/נק הקצה לדוגמא addproduct", "הפונקצה ")
// router.post("/CreateNewOrder/:id",CreateNewOrder );
router.post("/CreateNewOrder",CreateNewOrder );
router.get("/getAllOrders", getallorders)
router.put("/updateStatus/:id", updateStatus);


export default router;