import SubCategories_model from "../model/SubCategories.js";
import uploadImage from "../Service/Cloudinary.js";


export default {
  addSubCategory: async (req, res) => {
    if (req.file) {
      const result = await uploadImage(req.file.path);
      if (!result) throw new Error("Image not Valid");
      req.body.Subcategory_image = result;
    }
    try {
      const { Subcategory_name } = req.body;

      if (!Subcategory_name) throw new Error("SubCategory Name required!");
      console.log(req.body, "thi is the body of subcategory");
      //   Send to Collection request for add SubCategory
      const SubCategory = await SubCategories_model.create(req.body);

      res.status(200).json({
        success: true,
        message: "Success add category",
        SubCategory,
      });
    } catch (error) {
      if (error.code === 11000) error.message = "CategoryName already exist!";
      res.status(500).json({
        success: false,
        message: "not Success add category",
        error: error.message || error,
      });
    }
  },
  getAllSubCategory: async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const count = await SubCategories_model.countDocuments();

    const isLimit = limit === 0 ? count : limit;

    try {

      const SubCategory = await SubCategories_model.find()
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(isLimit);
        console.log(Math.ceil(count / limit),"cccccccc")

      res.status(200).json({
        success: true,
        message: "Success get all SubCategory",
        data:SubCategory,
        pages: (Math.ceil(count / limit))
       
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "not Success add category",
        error: error,
      });
    }
  },
  updateSubCategory: async (req, res) => {

    const subcategoryId = req.params.id;
    console.log(subcategoryId, "this is the update subcategoryId")
    const updateData = { ...req.body };
    console.log(updateData, "this is the update")

    if (req.file) {
      const result = await uploadImage(req.file.path);
      if (!result) {
        updateData.Subcategory_image = null;

        throw new Error("Image not Valid");
      }
      console.log(result, "zzzzzzz")

      updateData.Subcategory_image = result;
      // console.log(updateData.category_image, "bbbbbbbbbbbbbbbbb")
    }
    console.log(req.body.Subcategory_image)
    if (!updateData.Subcategory_image) updateData.Subcategory_image = null


    try {
      const { id } = req.params;

      await SubCategories_model.findByIdAndUpdate(subcategoryId, updateData, { new: true });

      res.status(200).json({
        success: true,
        message: "Success Update category"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "not Success Update category",
        error: error.message || error,
      });
    }
  },
  deleteSubCategory: async (req, res) => {
    try {
      const { id } = req.params;
      console.log(id)
      await SubCategories_model.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Success Delete category"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "not Success Delete category",
        error: error.message || error,
      });
    }
  },
  deletSelectedSubCategories: async (req, res) => {
    try {
      // console.log("hhhhhhhhhhh")
      // const { editObject } = req.body;

      // console.log(req.body, "to hhh")
      // וידוא שנשלח מערך של מזהים
      // if (!editObject || !Array.isArray(editObject) || editObject.length === 0) {
      //   return res.status(400).json({ 
      //     success: false, 
      //     message: 'נדרש מערך של מזהים למחיקה' 
      //   });
      // }

      // מחיקת כל הקטגוריות שהמזהים שלהן נמצאים במערך לבצע תחקור על כך 
      const result = await SubCategories_model.deleteMany({ _id: { $in: req.body } });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'לא נמצאו תת קטגוריות למחיקה'
        });
      }

      res.status(200).json({
        success: true,
        message: `${result.deletedCount}  תת קטגוריות נמחקו בהצלחה `,
        deletedCount: result.deletedCount
      });
    } catch (error) {
      console.error('שגיאה במחיקת תת  קטגוריות:', error);
      res.status(500).json({
        success: false,
        message: 'שגיאת שרת במחיקת  תת קטגוריות',
        error: error.message
      });
    }
  }

};