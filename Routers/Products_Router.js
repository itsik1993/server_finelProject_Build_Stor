import {Router} from "express"
import queries from "../Controllers/Products_Controllers.js"
import upload from "../middelware/parseFiles.js"

const router = Router();
//להכניס את הפונציות מתוך הקונטרולר
const {addProduct,getAllProducts,updateProduct,deleteProduct,deletSelectedProducts,getproductById,getuserCartProducts,} = queries;

router.post("/addProduct", addProduct);
router.get("/getAllProducts", getAllProducts);
router.get("/getProductBYid/:id",getproductById );
router.post("/getuserCartProducts",getuserCartProducts)
router.delete("/deleteProduct/:id", deleteProduct);
router.delete("/deletSelectedProducts", deletSelectedProducts);
router.put("/updateProduct/:id", updateProduct);



export default router;