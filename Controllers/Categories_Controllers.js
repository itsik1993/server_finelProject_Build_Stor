import Categories_model from '../model/Categories_model.js';
import uploadImage from "../Service/Cloudinary.js"

export default {

  addCategory: async (req, res) => {
    // console.log(req)
    console.log(req.file, "this is the file of Category");
    if (req.file) {
      const result = await uploadImage(req.file.path);
      if (!result) throw new Error("Image not Valid");
      req.body.category_image = result;
    }
    if (req.body.category_SubCategories){
      const subCategoryIds = JSON.parse(req.body.category_SubCategories);
    req.body.category_SubCategories = subCategoryIds;
    }
    try {
      const { category_name } = req.body;

      // if (!category_name) throw new Error("Category Name required!");
      console.log(req.body, "thi is the body of Category");
      //   Send to Collection request for add SubCategory
      const Category = await Categories_model.create(req.body);
      console.log(Category, "this is the Category after add to DB");
       //לטפל בהוספת הSUBCATEGORY לקטגוריה
      res.status(200).json({
        success: true,
        message: "Success add category",
        Category,
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
  getAllCategory: async (req, res) => {
  let category;
    try {
      const { page , limit  ,all } = req.query;
      const count = await Categories_model.countDocuments();
      if(all==="true"){
        category = await Categories_model.find()
        .sort({ createdAt: -1 })
        .populate('category_SubCategories');

      }
      else{

      
      const isLimit = limit === 0 ? count : limit;
    // console.log("getAllCategory")
       category = await Categories_model.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(isLimit)
      .populate('category_SubCategories');
    }
      res.status(200).json({
        success: true,
        message: "Success get all Category",
        data:category,
        pages: Math.ceil(count / limit),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "not Success add category",
        error: error,
      });
    }
  },
  updateCategory: async (req, res) => {

    const categoryId = req.params.id;
    const updateData = { ...req.body };
    console.log(updateData,"this is the update")
    
    if (req.file) {
      const result = await uploadImage(req.file.path);
      // console.log(result,"zzzzzzz")
      if (!result){
        updateData.category_image = null; 

        throw new Error("Image not Valid");
      } 
      updateData.category_image= result;
      console.log(updateData.category_image,"bbbbbbbbbbbbbbbbb")
    }
    console.log(req.body.category_image)
    if(!updateData.category_image)updateData.category_image = null
    //מפה השינויים 
    if (req.body.category_SubCategories){
      const subCategoryIds = JSON.parse(req.body.category_SubCategories);
      updateData.category_SubCategories = subCategoryIds;
    }


    try {
      const { id } = req.params;

      await Categories_model.findByIdAndUpdate(categoryId,updateData, { new: true });

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
  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
console.log(id)
      await Categories_model.findByIdAndDelete(id);

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
  deletSelectedCategories: async (req,res) =>{
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
      const result = await Categories_model.deleteMany({ _id: { $in: req.body } });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'לא נמצאו קטגוריות למחיקה' 
        });
      }
      
      res.status(200).json({
        success: true,
        message: `${result.deletedCount} קטגוריות נמחקו בהצלחה`,
        deletedCount: result.deletedCount
      });
    } catch (error) {
      console.error('שגיאה במחיקת קטגוריות:', error);
      res.status(500).json({ 
        success: false, 
        message: 'שגיאת שרת במחיקת קטגוריות',
        error: error.message 
      });
    }
  }
};