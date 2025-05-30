import {Router} from "express"
import queries from "../Controllers/SubCategory_controllers.js"
import upload from "../middelware/parseFiles.js"


const router = Router();
//להכניס את הפונציות מתוך הקונטרולר
const {addSubCategory,getAllSubCategory,updateSubCategory,deleteSubCategory,deletSelectedSubCategories} = queries;


router.post("/addSubCategory",upload.single("Subcategory_image"), addSubCategory);
router.get("/getAllSubCategory", getAllSubCategory);
router.put("/updateSubCategory/:id",upload.single("Subcategory_image"), updateSubCategory);
router.delete("/deleteSubCategory/:id", deleteSubCategory);
router.delete("/deletSelectedSubCategories", deletSelectedSubCategories);




export default router;