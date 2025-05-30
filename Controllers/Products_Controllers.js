import Product_model from '../model/Products_model.js';
import uploadImage from "../Service/Cloudinary.js"
import imagegallery_modal from "../model/imagegallery_modal.js"
export default {
    
    //הפונקציות של המוצרים
     getAllProducts: async (req, res) => {


      
        try {
          const { page = 1, limit = 12 } = req.query;
          const count = await Product_model.countDocuments();
          const isLimit = limit === 0 ? count : limit;
          
        console.log(page, limit,"page page page")
          const product = await Product_model.find()
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(isLimit)
          .populate("product_category") // Populate את הקטגוריות
          .populate("product_Subcategory"); // Populate את תתי הקטגוריות

          // דוגמאות לחלק מהשדות לא קשור לקוד שלי אלא מפרוויקט אחר 
          // .populate([
          //   {path:"product_category", populate:
          //     {path:"products.productId",populate:
          //       {path:"categories"}}
          //      },
          // ]);

          // const orders = await orderModel.find().populate([
          //   { path: "user", select: "user_name user_email" },
          //   { path: "products.productId", populate: "categories" },
          // ]);
          //המשיכה של המידע כאן היא כשיש לי רק מסמך 1 בתוך השני (פופלייט בתוך פופולייט)
    
    
          res.status(200).json({
            success: true,
            message: "Success get all products",
            data:product,
            pages: Math.ceil(count / limit),
          });
        } catch (error) {
          console.log(error)
          res.status(500).json({
            success: false,
            message: "not Success get all products",
            error: error,
            
          });
        }


     

      },
      addProduct: async (req, res) => {
        // console.log(req)
   
        try {
          const { product_name } = req.body;
    
          // if (!category_name) throw new Error("Category Name required!");
          console.log(req.body, "thi is the body of Category");
          //   Send to Collection request for add SubCategory
          const product = await Product_model.create(req.body);
          console.log(product, "this is the Category after add to DB");
           //לטפל בהוספת הSUBCATEGORY לקטגוריה
          res.status(200).json({
            success: true,
            message: "Success add category",
            product,
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
      deleteProduct: async (req, res) => {
        console.log(req.params,"is the params")
        try {
          const { id } = req.params;
    console.log(id)
          await Product_model.findByIdAndDelete(id);
    
          res.status(200).json({
            success: true,
            message: "Success Delete product",
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: "not Success Delete product",
            error: error.message || error,
          });
        }
      },
       deletSelectedProducts: async (req,res) =>{
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
            const result = await Product_model.deleteMany({ _id: { $in: req.body } });
            
            if (result.deletedCount === 0) {
              return res.status(404).json({ 
                success: false, 
                message: 'לא נמצאו מוצרים למחיקה' 
              });
            }
            
            res.status(200).json({
              success: true,
              message: `${result.deletedCount} מוצרים נמחקו בהצלחה`,
              deletedCount: result.deletedCount
            });
          } catch (error) {
            console.error('שגיאה במחיקת מוצרים:', error);
            res.status(500).json({ 
              success: false, 
              message: 'שגיאת שרת במחיקת מוצרים',
              error: error.message 
            });
          }
        },
        getproductById: async (req, res) => {
          // console.log("הדעתי את המוצר לפי הID")
          try {
            const { id } = req.params;
            // console.log(id, "this is the id of product")
            const product = await Product_model.findById(id).populate("product_category").populate("product_Subcategory");
            if (!product) {
              return res.status(404).json({
                success: false,
                message: "Product not found",
              });
            }
            // console.log(product, "this is the product after get by id")
              res.status(200).json({
                success: true,
                message: "Success get product",
                data:product,
              }); 
            }
              catch (error) {
                res.status(500).json({
                  success: false,
                  message: "not Success get product",
                  error: error.message || error,
                });
              } 
            } ,
        getuserCartProducts: async (req, res) => {
          try {
            const cartItems = req.body; // מערך של { id, quantity }
        
            const fullCart = await Promise.all(
              cartItems.map(async (item) => {
                const product = await Product_model.findById(item.id)
                  .populate("product_category")
                  .populate("product_Subcategory");
        
                if (!product) {
                  // אם מוצר לא נמצא, אפשר לדלג או להחזיר שגיאה - כאן נדלג
                  return null;
                }
        
                return {
                  ...product.toObject(), // ממיר את המסמך לאובייקט רגיל
                  quantity: item.quantity
                };
              })
            );
        
            // מסנן מוצרים שלא נמצאו (null)
            const filteredCart = fullCart.filter((item) => item !== null);
        
            res.status(200).json({
              success: true,
              message: "Success get user cart products",
              data: filteredCart
            });
        
          } catch (error) {
            res.status(500).json({
              success: false,
              message: "Failed to get user cart products",
              error: error.message || error
            });
          }
        
        },
         updateProduct: async (req, res) => {
        
            const productId = req.params.id;
            const updateData = { ...req.body };
            console.log(updateData,"this is the update")
            try {
              const { id } = req.params;
        
              await Product_model.findByIdAndUpdate(productId,updateData, { new: true });
        
              res.status(200).json({
                success: true,
                message: "Success Update product"
              });
            } catch (error) {
              res.status(500).json({
                success: false,
                message: "not Success Update product",
                error: error.message || error,
              });
            }
          },
  };
