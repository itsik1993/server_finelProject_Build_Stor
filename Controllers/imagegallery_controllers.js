import imagegallery_modal from "../model/imagegallery_modal.js";
import uploadImage from "../Service/Cloudinary.js";




export default {
     getAllImage: async (req, res) => {
      
        try {
        //   const { page = 1, limit = 10 } = req.query;
          const count = await imagegallery_modal.countDocuments();
        //   const isLimit = limit === 0 ? count : limit;
        // console.log("getAllCategory")
          const Albom = await imagegallery_modal.find()
          .sort({ createdAt: -1 })
        //   .skip((page - 1) * limit)
        //   .limit(isLimit)
        //   .populate('category_SubCategories');
    
          res.status(200).json({
            success: true,
            message: "Success get all photo albom",
            data:Albom,
            // pages: Math.ceil(count / limit),
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: "not Success get albom",
            error: error,
          });
        }
      },

    uploadphoto: async (req, res) => {
        // console.log(req)
        const AllAlboms = await imagegallery_modal.find()
        // console.log(req.file, "this is the file of Category");
        // console.log(AllAlboms[0]._id ,"AllAlboms");
        // const id=AllAlboms[0]._id.toString()
        // console.log(id,"jjjjjjjjjjjjj")
        
        try {
            // const result=""
            if (req.file) {
                // console.log(req.file.path,"hhhiiii")
               const   result= await uploadImage(req.file.path);
               if (!result) throw new Error("Image not Valid");
               if (AllAlboms.length > 0) {
                const idToUpdate = AllAlboms[0]._id; // קבל את ה-ID של המסמך הראשון
                AllAlboms[0].Albom.push(result);
                const update = { Albom: AllAlboms[0].Albom }; // צור אובייקט עדכון עם המערך Albom המעודכן
                const albom = await imagegallery_modal.findByIdAndUpdate(idToUpdate, update, { new: true });
                res.status(200).json({
                    success: true,
                    message: "Success add photo URL",
                    result,
                    albom
                  });
            }
            else
            {
               const obj={
                    Albom:[result]

                }
          const albom = await imagegallery_modal.create(obj);
          res.status(200).json({
            success: true,
            message: "Success add photo URL",
            result,
          });

            }
            // const newAlbom=[...AllAlboms,result,{new:true}]
               
        //   console.log(newAlbom, "this is the result of check");
        
               
              }

    
          // if (!category_name) throw new Error("Category Name required!");
          //   Send to Collection request for add SubCategory
         
           //לטפל בהוספת הSUBCATEGORY לקטגוריה
        
        } catch (error) {
          if (error.code === 11000) error.message = "CategoryName already exist!";
          res.status(500).json({
            success: false,
            message: "not Success add photo",
            error: error.message || error,
          });
        }
      },

}