import {Router} from "express"
import queries from "../Controllers/Categories_Controllers.js"
import upload from "../middelware/parseFiles.js"

const router = Router();
//להכניס את הפונציות מתוך הקונטרולר
const {addCategory,getAllCategory,updateCategory,deleteCategory,deletSelectedCategories} = queries;


router.post("/addCategory",upload.single("category_image"), addCategory);
router.get("/getAllCategory", getAllCategory);
router.put("/updateCategory/:id",upload.single("category_image"), updateCategory);
router.delete("/deleteCategory/:id", deleteCategory);
router.delete("/deletSelectedCategories", deletSelectedCategories);



export default router;