import {Router} from "express"
import upload from "../middelware/parseFiles.js"
import queries from "../Controllers/imagegallery_controllers.js";




const router = Router();

const {uploadphoto,getAllImage} = queries;

router.post("/uploadphoto",upload.single("image"),uploadphoto);
router.get("/getphoto",getAllImage);



export default router;