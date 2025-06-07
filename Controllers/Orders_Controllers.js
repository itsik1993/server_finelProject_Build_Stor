import Order_model from '../model/Orders_model.js';
// import User_model from "../model/user_model.js";
import transporter from "../Service/Mail.js";

export default {
  
    //הפונקציות של הזמנות
    CreateNewOrder: async (req, res) => {
    try {
      const { id } = req.params;
      const{orderdata}=req.body
    // console.log(id,"הרגע של יצירת ההזמנה")
    // console.log(orderdata," orderdata הרגע של יצירת ההזמנה")

    const order = await Order_model.create(orderdata);
    const products =[...orderdata.order_products]
  console.log(products , "print products")

// יצירת שורות הטבלה באופן דינמי
const orderItemsHTML = products.map(item => {
  // קביעת נתיבי המוצר בצורה דינמית
  const productName = item.product_name? item.product_name : item._id.product_name  ;
  const productPrice = item.product_costumer_price ? item.product_costumer_price :item._id.product_costumer_price  ;
  const productImage = item.product_image ?item.product_image : item._id.product_image ;

  const itemTotalPrice = Number(item.quantity) * Number(productPrice);
console.log(itemTotalPrice,"itemTotalPrice")
console.log(productName,"productName")
console.log(productPrice,"productPrice")
  return `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${productName}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">₪${Number(productPrice).toFixed(2)}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">₪${Number(itemTotalPrice).toFixed(2)}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
        <img src="${productImage}" alt="${productName}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
      </td>
    </tr>
  `;
}).join('');
 // חשוב לחבר את המערך למחרוזת אחת

  const emailHTML = `
  <div style="background-color: #f6f6f6; padding: 20px; font-family: Arial, sans-serif;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">

      <div style="text-align: center; margin-bottom: 20px;">
        <img src="YOUR_LOGO_URL" alt="Company Logo" style="max-width: 150px;">
      </div>

      <div style="margin-bottom: 30px; color: #444444;">
        <h1 style="color: #333333; font-size: 24px; margin-bottom: 15px;">אישור הזמנה :</h1>
        <pstyle="color: #333333; font-size: 24px; margin-bottom: 20px;">${order._id}</p>
        <p>שלום ,</p>
        <p>תודה רבה על הזמנתך! להלן פרטי ההזמנה שלך:</p>
       

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">שם המוצר</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">כמות</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">מחיר יחידה</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">סה"כ לפריט</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">תמונה</th>
            </tr>
          </thead>
          <tbody>
            ${orderItemsHTML} </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">סה"כ לתשלום:₪${Number(orderdata.order_total_price).toFixed(2)}</td>
             
            </tr>
          </tfoot>
        </table>
        <p style="margin-top: 20px;">קיבלת אישור על הזמנתך בדוא"ל שסיפקת: ${orderdata.order_costumer_mail}.</p>
        <p>נעדכן אותך כאשר ההזמנה תהיה בדרכה אליך.</p>
    <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_DOMAIN}"
            style="background-color: #007bff; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            לכניסה לאתר
          </a>
        </div>
      

        <p>בכל שאלה או בירור, אל תהסס לפנות אלינו.</p>
      </div>


    </div>
  </div>
`;

  transporter.sendMail({
        from: process.env.MAIL_AUTH_USER, // sender address
        to: orderdata.order_costumer_mail,
        subject: "order confirmation", // Subject line
        // text: "Hello world?", // plain text body
        html: emailHTML, // html body
      });

    
    
      console.log(order," אחרי שליחה לשרת");
      res.status(200).json({
        success: true,
        message: "Success create order",
        order,
      });
    
      
    } catch (error) {
      console.log(error);
      res.status(401).json({
        success: false,
        message: "not Success create order",
        error: error.message || error,
      });
      
    }
    
  },
  getallorders :async(req,res)=>{

    try{
          const { page = 1, limit = 12 } = req.query;
          const count = await Order_model.countDocuments();
          const isLimit = limit === 0 ? count : limit;
          
        console.log(page, limit,"page page page")
          const order = await Order_model.find()
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(isLimit)
          .populate("order_user")
          .populate("order_products._id")
          
          // .populate("product_category") // Populate את הקטגוריות
          // .populate("product_Subcategory"); // Populate את תתי הקטגוריות

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
            message: "Success get all orders",
            data:order,
            pages: Math.ceil(count / limit),
          });
        } catch (error) {
          console.log(error)
          res.status(500).json({
            success: false,
            message: "not Success get all orders",
            error: error,
            
          });
        }


  },
  updateStatus: async (req, res) => {
    try {
      const { id } = req.params;
// console.log(req.body.status,"דיווח")
      const order = await Order_model.findByIdAndUpdate(
        id,
        {order_status: req.body.status },
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "Success update Status Order",
        data: order,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "not Success update Status Order",
        error: error.message || error,
      });
    }
  },


  };