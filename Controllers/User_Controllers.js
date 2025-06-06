import User_model from "../model/user_model.js";
import transporter from "../Service/Mail.js";
import crypto from "crypto";
import { compare, hash } from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { nanoid } from 'nanoid';


// import { config } from "dotenv";
// config();


export default {

  // function to register in the app 
  Register: async (req, res) => {
    try {
      console.log(req.body, "this is the body");
      // to check if the user fill all the fields
      // const { user_name, user_password, user_email } = req.body;

      // if (!user_name || !user_password || !user_email)
      //   throw new Error("all fields required!");

      //Crating the object of the user from the request body
      const user = await User_model.create(req.body);


      //crtating the html code for the verification email
      const emailHTML = `
      <div style="background-color: #f6f6f6; padding: 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="YOUR_LOGO_URL" alt="Company Logo" style="max-width: 150px;">
          </div>

          <!-- Content -->
          <div style="margin-bottom: 30px; color: #444444;">
            <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Verify Your Email</h1>
            <p>Dear  ${user.user_firstname}    ${user.user_lastname},</p>
            <p>תודה שנרשמת לאתר, כדי להתחיל להנות ולהיכנס לאתר עליך לבצע אימות עי  לחיצה על הפתור למטה:</p>
            
            <!-- Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.SERVER_DOMAIM}/Users/verify-email?email=${user.user_email}&token=${user.verificationToken}" 
                 style="background-color: #007bff; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                אימות החשבון
              </a>
            </div>
            
            <p>אם לא ביצעת את ההרשמה ניתן להתעלם ממייל זה</p>
            <p>הלינק פג תוקף בתוך 24 שעות.</p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; color: #666666; font-size: 12px;">
            <p>© 2024 Your Company Name. All rights reserved.</p>
            <p>Company Address, City, Country</p>
          </div>
        </div>
      </div>
    `;
      //sending the email to the user for verification
      transporter.sendMail({
        from: process.env.MAIL_AUTH_USER, // sender address
        to: user.user_email,
        subject: "אימות חשבון", // Subject line
        // text: "Hello world?", // plain text body
        html: emailHTML, // html body
      });


      console.log(user);
      res.status(200).json({
        success: true,
        message: "הרשמה בוצעה בהצלחה, נשלח אליך מייל לאימות החשבון",
        user,
      });


    } catch (error) {
      console.log(error);
      res.status(401).json({
        success: false,
        message: "הייתה בעיה בהרשמה שלך, נסה שוב מאוחר יותר",
        error: error.message || error,
      });

    }


  },
  verifyEmail: async (req, res) => {
    let userToken = {
      user_firstname: "",
      user_lastname: "",
      user_email: "",
      user_id: "",
      verifyEmail: true,

    }

    try {
      //take from the query the email and the token
      const { email, token } = req.query;
      //check if the email and the token are exist in the document and update the document
      const user = await User_model.findOne(
        {
          //this is the condition that we want to check
          user_email: email,
          verificationToken: token,
        })
      console.log(user, "this is the user found");
      if (!user) throw new Error("Verification Filed")

      if (user.replacementEmail) {
        console.log(user.replacementEmail, "this is the replacement email");
        // if the user has a replacement email, we update the user email to the replacement email and set the replacement email to null
        await User_model.updateOne(
          { user_email: email },
          { $set: { user_email: user.replacementEmail, replacementEmail: null, verificationToken: null }, new: true }
        );
        userToken = {
          user_firstname: user.user_firstname,
          user_lastname: user.user_lastname,
          user_email: user.replacementEmail,
          user_id: user._id,
          verifyEmail: user.verifyEmail,

        }
      }
      else {
        console.log("this is the else condition");
        // if the user does not have a replacement email, we update the user document to set the verificationToken to null and verifyEmail to true
        await User_model.updateOne(
          { user_email: email, verificationToken: token },
          { $set: { verificationToken: null, verifyEmail: true } }
        );
        userToken = {
          user_firstname: user.user_firstname,
          user_lastname: user.user_lastname,
          user_email: user.user_email,
          user_id: user._id,
          verifyEmail: user.verifyEmail,

        }

      }
      // {
      //thi is the update that we want to do
      //   $set: {
      //     verificationToken: null,
      //     verifyEmail: true,
      //   },
      // }
      ;
      console.log(userToken, "this is the user after update");
      //מפה השינוי 
      // if(user.replacementEmail){
      // const user=  await User_model.updateOne(
      //     { user_email: email },
      //     { $set: { user_email: user.replacementEmail, replacementEmail: null },new: true }
      //   );
      // }


      // res.redirect('http://localhost:5174/User/Profile');
      //  const userToken={
      //   user_firstname: user.user_firstname,
      //   user_lastname: user.user_lastname,
      //   user_email: user.user_email,
      //   user_id: user._id,
      //   verifyEmail: user.verifyEmail,

      // }
      const token2 = jwt.sign({ ...userToken }, process.env.JWT_SECRET, {
        expiresIn: 60 * 60 * 1,
      });
      console.log(token2, "this is the token");

      // הקוד המתוקן - שימוש נכון בפונקציית res.cookie עם האופציות כפרמטר שלישי
      res.cookie("token", token2, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 1,
      });
      res.send("המייל  אומת בהצלחה אתה יכול להיכנס לאתר  ");





    } catch (error) {
      res.status(401).json({
        success: false,
        message: "not Success Update User",
        error: error.message || error,
      });
    }
  },
  signWithGoogle: async (req, res) => {
    console.log("this is the signWithGoogle function")
    try {
      const { code } = req.body;
      console.log("this is code ", code);
      console.log("DEBUG: GOOGLE_CLIENT_ID =", process.env.GOOGLE_CLIENT_ID);
      console.log("DEBUG: GOOGLE_CLIENT_SECRET =", process.env.GOOGLE_CLIENT_SECRET ? "Loaded (not displayed)" : "UNDEFINED/EMPTY"); // לא להדפיס את הסוד עצמו
      console.log("DEBUG: GOOGLE_REDIRECT_URI =", process.env.GOOGLE_REDIRECT_URI);
      let user = {};
      let newUser = {};

      const oAuth2client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI

      )


      const { tokens } = await oAuth2client.getToken(code);
      const ticket = await oAuth2client.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
      console.log(ticket.getPayload());
      const check = ticket.getPayload()
      console.log(check, "this is the check email");
      // create condition for user exist or not
      // save the model of user to collection in DB
      // send Cookie to User.
      // res.json({succes:true})....

      const userToken = {
        user_firstname: check.given_name,
        user_lastname: check.family_name,
        user_email: check.email,
        verifyEmail: check.email_verified,

      }

      const AuthToken = jwt.sign({ ...userToken }, process.env.JWT_SECRET, {
        expiresIn: 60 * 60 * 1,
      })
      //  console.log(AuthToken,"this is the auth token");
      const userExist = await User_model.findOne({ user_email: ticket.getPayload().email })
        .populate("user_shopping_cart._id")
        .populate([
          {
            path: "user_orders_history", populate:
              { path: "order_products._id", model: "Products" }
          }


        ])
        // .populate("user_whishlist"); // כדי להחזיר פרטים מלאים;
          .populate({
    path: "user_whishlist", // נניח שזה השם הנכון של השדה במודל המשתמש
    model: "Products", // מאיזה מודל לשלוף את הפריטים ב-whishlist (המוצרים)
    populate: [
      {
        path: "product_category", // השדה בתוך מודל המוצר שמכיל את ID הקטגוריה
        model: "Categories", // המודל של הקטגוריות
      },
      {
        path: "product_Subcategory", // השדה בתוך מודל המוצר שמכיל את ID התת-קטגוריה
        model: "SubCategories", // המודל של התת-קטגוריות
      },
    ],
  });
      console.log(userExist, "this is the user exist");
      if (!userExist) {
        user = {
          user_firstname: ticket.getPayload().given_name,
          user_lastname: ticket.getPayload().family_name,
          user_email: ticket.getPayload().email,
          SignUpProvider: "google",
          verifyEmail: true,
          verificationToken: null,
        }

        console.log(user, "this is the user created");
        newUser = await User_model.create(user);
      }


      res.cookie("token", AuthToken), {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 1,
      }
      // if(userExist){
      // res.json({
      //   succes:true,
      //   message:"Success Sign with Google",
      //   userExist

      // });
      // }
      // else{
      //   res.json({
      //     succes:true,
      //     message:"Success Sign with Google",
      //     // user,
      //     newUser

      //   });
      res.json({
        success: true,
        message: "Success Sign with Google",
        user: userExist || newUser  // תמיד תחזיר את המשתמש תחת אותו מפתח
      });
    }


    catch (error) {
      console.log(error);

    }



  },

  // function to log in the app
  Login: async (req, res) => {
    try {
      console.log(req.body, "this is the body");
      const { user_email, user_password } = req.body
      console.log(user_email, user_password, "this is the email and password");
      if (!user_password || !user_email)
        throw new Error("all fields required!");

      // if Email Exist
      const user = await User_model.findOne({ user_email })
        .populate("user_shopping_cart._id")
        .populate([
          {
            path: "user_orders_history", populate:
              { path: "order_products._id", model: "Products" }
          }

        ])
        // .populate("user_whishlist")
       
          .populate({
    path: "user_whishlist", // נניח שזה השם הנכון של השדה במודל המשתמש
    model: "Products", // מאיזה מודל לשלוף את הפריטים ב-whishlist (המוצרים)
    populate: [
      {
        path: "product_category", // השדה בתוך מודל המוצר שמכיל את ID הקטגוריה
        model: "Categories", // המודל של הקטגוריות
      },
      {
        path: "product_Subcategory", // השדה בתוך מודל המוצר שמכיל את ID התת-קטגוריה
        model: "SubCategories", // המודל של התת-קטגוריות
      },
    ],
  });

      console.log(user, "this is the user found");

      // if(!user.verifyEmail) throw new Error("You Must Verify to Email!!");
      if (!user) throw new Error("User Not Exist!");
      if (user.verifyEmail === false) {
        console.log(user.verifyEmail, "this is the verify email");
        throw new Error("You Must Verify to Email!!")
      }

      // if Password match
      const isMatch = await compare(user_password, user.user_password);
      console.log(isMatch, "this is the isMatch");

      if (!isMatch) throw new Error("Password or Email is not Valid!");

      user.user_password = "******";

      // Send User Token For Experience with ReAuthenticate and send Cookie to User.
      const userToken = {
        user_firstname: user.user_firstname,
        user_lastname: user.user_lastname,
        user_email: user.user_email,
        user_id: user._id,
        verifyEmail: user.verifyEmail,

      }
      const token = jwt.sign({ ...userToken }, process.env.JWT_SECRET, {
        expiresIn: 60 * 60 * 1,
      });
      console.log(token, "this is the token");

      // הקוד המתוקן - שימוש נכון בפונקציית res.cookie עם האופציות כפרמטר שלישי
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 1,
      });

      //the finel response to the user
      res.status(200).json({
        success: true,
        message: "Success Login User",
        user,
      });
    }
    catch (error) {
      res.status(401).json({
        success: false,
        message: "not Success Login User",
        error: error.message || error,
      });
    }
  },
  authenticate: async (req, res) => {
    try {
      const { token } = req.cookies;
      // console.log(token, "zzzzzz")
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode.user_email, "this is the decode token");
      if (!decode) throw new Error("Token Not Valid");
      const user = await User_model.findOne({
        user_email: decode.user_email,
      }).populate("user_shopping_cart._id")
      .populate("user_orders_history")
      // .populate("user_whishlist");
       // כדי להחזיר פרטים מלאים;
         .populate({
    path: "user_whishlist", // נניח שזה השם הנכון של השדה במודל המשתמש
    model: "Products", // מאיזה מודל לשלוף את הפריטים ב-whishlist (המוצרים)
    populate: [
      {
        path: "product_category", // השדה בתוך מודל המוצר שמכיל את ID הקטגוריה
        model: "Categories", // המודל של הקטגוריות
      },
      {
        path: "product_Subcategory", // השדה בתוך מודל המוצר שמכיל את ID התת-קטגוריה
        model: "SubCategories", // המודל של התת-קטגוריות
      },
    ],
  });
      console.log(user, "this is the user found in authenticate");
      req.user = decode;
      res.status(200).json({
        success: true,
        message: "Success Authenticate User",
        user: user,
      });
    }

    catch (error) {
      console.log(error);
      res.status(401).json({ success: false, error: error.message });
    }

  },
  logout: async (req, res) => {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: true,
      });

      res.status(200).json({
        success: true,
        message: "Success Logout User",
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "not Success Logout User",
        error: error.message || error,
      });
    }
  },
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.query;

      // Encoded the resetToken for validate user email later
      const refreshPasswordToken = crypto.randomBytes(20).toString("hex");

      const ResetPasswordToken = crypto
        .createHash("sha256")
        .update(refreshPasswordToken)
        .digest("hex");

      // define how much long the token until expire
      const resetPasswordTokenExpiry = new Date(Date.now() + (1000 * 60 * 10)); // 10 mintues

      // Update Database user Document on resetToken
      await User_model.findOneAndUpdate(
        { user_email: email },
        { ResetPasswordToken, resetPasswordTokenExpiry }
      );

      const emailHTML = `
        <div style="background-color: #f6f6f6; padding: 20px; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
            
            <!-- Logo -->
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="YOUR_LOGO_URL" alt="Company Logo" style="max-width: 150px;">
            </div>
  
            <!-- Content -->
            <div style="margin-bottom: 30px; color: #444444;">
              <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Password Reset Request</h1>
              <p>Hello,</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              
              <!-- Button -->
              <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_DOMAIN}/resetPassword?email=${email}&token=${refreshPasswordToken}" style="background-color: #007bff; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>              </div>
              
              <p>If you didn't request this password reset, please ignore this email.</p>
              <p>This link will expire in 10 minutes.</p>
            </div>
  
            <!-- Footer -->
            <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; color: #666666; font-size: 12px;">
              <p>© 2024 Your Company Name. All rights reserved.</p>
              <p>Company Address, City, Country</p>
            </div>
          </div>
        </div>
      `;

      // Send Email For Recovery Account
      transporter.sendMail({
        from: process.env.MAIL_AUTH_USER, // sender address
        to: email, // list of receivers
        subject: "Forgot Password", // Subject line
        html: emailHTML, // html body
      });

      res.status(200).json({
        success: true,
        message: "Success send Email for recovery account",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "not Success send Email for recovery account",
        error: error.message || error,
      });
    }
  },
  resetPassword: async (req, res) => {
    try {
      const { email, token } = req.query;
      const { user_password } = req.body;
      console.log(email, token, user_password, "this is the email and token and password 1111");
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      const passwordHash = await hash(user_password, 10);

      const user = await User_model.updateOne(
        {
          user_email: email,
          ResetPasswordToken: hashedToken,
          resetPasswordTokenExpiry: { $gt: Date.now() },
        },
        {
          $set: {
            user_password: passwordHash,
            ResetPasswordToken: null,
            resetPasswordTokenExpiry: null
          }
        }
      );

      if (!user.matchedCount) throw new Error("the request Expire");

      res.status(200).json({
        success: true,
        message: "Success change password",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "not Success change password",
        error: error.message || error,
      });
    }
  },
  getallusers: async (req, res) => {

    try {
      const { page = 1, limit = 10 } = req.query;
      const count = await User_model.countDocuments();
      const isLimit = limit === 0 ? count : limit;
      // console.log("getAllCategory")
 const users = await User_model.find()
  .sort({ createdAt: -1 })
  .skip((page - 1) * limit)
  .limit(isLimit)
  .populate("user_shopping_cart._id") // נשאר כפי שהיה, בהנחה שזה ID של מוצר בסל הקניות
  .populate([
    {
      path: "user_orders_history",
      populate: { path: "order_products._id", model: "Products" },
    },
  ])
  .populate({
    path: "user_whishlist", // נניח שזה השם הנכון של השדה במודל המשתמש
    model: "Products", // מאיזה מודל לשלוף את הפריטים ב-whishlist (המוצרים)
    populate: [
      {
        path: "product_category", // השדה בתוך מודל המוצר שמכיל את ID הקטגוריה
        model: "Categories", // המודל של הקטגוריות
      },
      {
        path: "product_Subcategory", // השדה בתוך מודל המוצר שמכיל את ID התת-קטגוריה
        model: "SubCategories", // המודל של התת-קטגוריות
      },
    ],
  });
      // פה אני צריך לעשות POPULAT פנימי כדי להביא את המוצרים כי שמור לי רק ID

      res.status(200).json({
        success: true,
        message: "Success get all users",
        data: users,
        pages: Math.ceil(count / limit),
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "not Success add users",
        error: error,
      });
    }
  },
  getuser: async (req, res) => {
    const { id } = req.params;

    try {

      const user = await User_model.findById(id)
        .populate("user_shopping_cart._id")
        // .populate("user_orders_history")
        .populate([
          {
            path: "user_orders_history", populate:
              { path: "order_products._id", model: "Products" }
          }

        ])
        .populate("user_whishlist")
      // פה אני צריך לעשות POPULAT פנימי כדי להביא את המוצרים כי שמור לי רק ID

      res.status(200).json({
        success: true,
        message: "Success get the user",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "not Success grt the user",
        error: error,
      });
    }
  },

  setShoppingCart: async (req, res) => {
    console.log("this is the setShoppingCart function")
    try {
      const { id } = req.params;
      const newCart = req.body;
      console.log(newCart, "תסתכל פה מה זה עושה ");
      // ולידציה בסיסית
      if (!Array.isArray(newCart)) {
        return res.status(400).json({
          success: false,
          message: "Invalid cart format",
        });
      }

      // ניקוי מבנה העגלה כדי לוודא שמכילה רק product_id ו-quantity
      // const cleanedCart = newCart.map(item => ({
      //   _id: item.product_id,
      //   quantity: item.quantity
      // }));
      newCart.forEach(item => {
        item._id = item.id;
        delete item.id;
      });

      // עדכון במסד הנתונים
      const user = await User_model.findByIdAndUpdate(
        id,
        { $set: { user_shopping_cart: newCart } },
        { new: true }
      )
        .populate("user_shopping_cart._id"); // כדי להחזיר פרטים מלאים

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      res.status(200).json({
        success: true,
        message: "Cart updated successfully",
        data: user
      });
    } catch (error) {
      console.error("Error updating cart:", error);
      res.status(500).json({
        success: false,
        message: "Server error updating cart",
        error: error.message
      });
    }
  },
  updateUser: async (req, res) => {
    try {
      console.log(req.body, "this is the body");
      const { id } = req.params;
      const { city,
        street,
        building_number,
        aprtmernt_number,
        phone,
        postal_code
      } = req.body;
      console.log(phone, "this is the body of the update user")
      const updateObj = {
        "user_address.user_city": city,
        "user_address.user_street": street,
        "user_address.user_Bilding_number": building_number,
        "user_address.user_apartment_number": aprtmernt_number,
        "user_address.user_postal_code": postal_code,
        user_phone_number: phone
      };


      const userupdae = await User_model.findByIdAndUpdate(id, {
        $set: updateObj
      }, { new: true });

      if (!userupdae) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
      res.status(200).json({
        success: true,
        message: "Success update user",
        data: userupdae,
      });
    }
    catch (error) {
      res.status(500).json({
        success: false,
        message: "not Success update user",
        error: error.message || error,
      });
    }
  },
  updateUserOrder: async (req, res) => {
    try {
      console.log("updateUserOrder Function started");
      console.log(req.body, "קיבלנו את הפרמטר הזה");

      const { id } = req.params;
      const { orderId } = req.body;

      console.log("User ID:", id);
      console.log("Order ID:", orderId);

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message: "Order ID is required",
          error: "Missing order ID parameter"
        });
      }

      // **השלב הקריטי:** וודא ש-orderId הוא ObjectId
      let orderObjectId;
      if (mongoose.Types.ObjectId.isValid(orderId)) { // בדוק אם ה-ID תקני
        orderObjectId = new mongoose.Types.ObjectId(orderId);
      } else {
        return res.status(400).json({ message: "Invalid Order ID provided." });
      }
      // עדכון המשתמש - הוספת ההזמנה להיסטוריה וניקוי העגלה
      const user = await User_model.findById(id);
      // const updatedUser = await User_model.findByIdAndUpdate(
      //   id,
      //   { 
      //     $push: { user_orders_history: orderId }, 
      //     $set: { user_shopping_cart: [] } 
      //   },
      //   { new: true }
      // );
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      // user.user_orders_history.push(orderObjectId);
      user.user_orders_history.unshift(orderObjectId);
      user.user_shopping_cart = []; // נקה את העגלה כאן
      await user.save();

      res.status(200).json({
        success: true,
        message: "Successfully updated user order history",
        data: user,
      });
    }
    catch (error) {
      console.error("Error in updateUserOrder:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update user order history",
        error: error.message || error,
      });
    }
  },
  updateProfileWith_No_mail: async (req, res) => {
    console.log("updateProfileWithNomail Function started");
    console.log(req.body, "קיבלנו את הפרמטר הזה");
    try {


      const { id } = req.params;

      // const { user_email } = req.body;

      // console.log("User ID:", id);

      // if (!user_firstname || !user_lastname || !user_phone_number) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "All fields are required",
      //     error: "Missing required parameters"
      //   });
      // }

      // עדכון המשתמש
      const updatedUser = await User_model.findByIdAndUpdate(
        id, (req.body)
        ,
        { new: true }
      );


      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }

      res.status(200).json({
        success: true,
        message: "Successfully updated user profile",
        data: updatedUser,
      });
    }
    catch (error) {
      console.error("Error in updateProfileWithNomail:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update user profile",
        error: error.message || error,
      });
    }
  },
  updateProfileWithMail: async (req, res) => {
    try {
      console.log("updateProfileWithMail Function started");
      console.log(req.body, "קיבלנו את הפרמטר הזה");

      const { id } = req.params;
      const { replacementEmail, user_firstname, user_lastname, user_email } = req.body;
      const newVerificationToken = nanoid();

      // console.log("User ID:", id);

      // if (!user_firstname || !user_lastname || !user_phone_number || !user_email) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "All fields are required",
      //     error: "Missing required parameters"
      //   });
      // }
      console.log(newVerificationToken, "this is the replacement email");

      const useremail = await User_model.findOne({user_email: replacementEmail });
      if (useremail) {
        console.log("מעולה שנכשל");
        return res.status(400).json({
          success: false,
          message: "לא ניתן לבצע את השינוי למייל הנוכחי",
          error: "המייל כבר קיים במערכת",
        });
      }

      // עדכון המשתמש
      const updatedUser = await User_model.findByIdAndUpdate(
        id,
        {
          ...req.body,
          verificationToken: newVerificationToken,
        }
        ,
        { new: true }
      );

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }
      const emailHTML = `
      <div style="background-color: #f6f6f6; padding: 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="YOUR_LOGO_URL" alt="Company Logo" style="max-width: 150px;">
          </div>

          <!-- Content -->
          <div style="margin-bottom: 30px; color: #444444;">
            <h1 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Verify Your Email</h1>
            <p>Dear  ${updatedUser.user_firstname}    ${updatedUser.user_lastname},</p>
            <p>מאחר ובוצע שינוי במייל עליך לבצע אימות מייל לצורך סיום השינוי, על מנת להשלים את התהליך עליך לללחוץ על הלינק למטה:</p>
            
            <!-- Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.SERVER_DOMAIM}/verify-email?email=${updatedUser.user_email}&token=${updatedUser.verificationToken}" 
                 style="background-color: #007bff; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Verify Email
              </a>
            </div>
            
            <p>אם לא ביצעת שינוי - אנא השב למייל זה וניצור עימך קשר בהקדם</p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; color: #666666; font-size: 12px;">
            <p>© 2024 Your Company Name. All rights reserved.</p>
            <p>Company Address, City, Country</p>
          </div>
        </div>
      </div>
    `;
      //sending the email to the user for verification
      transporter.sendMail({
        from: process.env.MAIL_AUTH_USER, // sender address
        to: replacementEmail,
        subject: "verification Email", // Subject line
        // text: "Hello world?", // plain text body
        html: emailHTML, // html body
      });

      res.status(200).json({
        success: true,
        message: "Successfully updated user profile",
        data: updatedUser,
      });
    }
    catch (error) {
      console.error("Error in updateProfileWithMail:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update user profile",
        error: error.message || error,
      });
    }
  },
  AddToishList: async (req, res) => {
    try {
      console.log("UpdateWishList Function started");

      const { id } = req.params;
      const { wishList } = req.body;
      console.log(wishList, "קיבלנו את הפרמטר הזה");

      console.log("User ID:", id);

      // if (!wishList || !Array.isArray(wishList)) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Wish List must be an array",
      //     error: "Missing or invalid wish list parameter"
      //   });
      // }

      // עדכון המשתמש
      const updatedUser = await User_model.findByIdAndUpdate(
        id,
        { $set: { user_whishlist: req.body } },
        { new: true }
      );


      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }

      res.status(200).json({
        success: true,
        message: "Successfully updated user wish list",
        data: updatedUser,
      });
    }
    catch (error) {
      console.error("Error in UpdateWishList:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update user wish list",
        error: error.message || error,
      });
    }
  },
  RemoveFromWishList: async (req, res) => {
    try {
      console.log("UpdateWishList Function started");

      const { id } = req.params;
      // const { wishList } = req.body;
      // console.log(wishList, "קיבלנו את הפרמטר הזה");
      console.log(req.body.productId, "this is the body of the remove from wish list");
      console.log("User ID:", id);

      // if (!wishList || !Array.isArray(wishList)) {
      //   return res.status(400).json({
      //     success: false,
      //     message: "Wish List must be an array",
      //     error: "Missing or invalid wish list parameter"
      //   });
      // }
      const user = await User_model.findById(id);
      if (!user) {
        return res.status(404).json({ message: "User not found." });
      }
      const updatedWishList = user.user_whishlist.filter(item => item._id.toString() !== req.body.productId.toString());
      console.log(updatedWishList, "this is the updated wish list");
      // עדכון המשתמש

      const updatedUser = await User_model.findByIdAndUpdate(
        id,
        { $set: { user_whishlist: updatedWishList } },
        { new: true }
      );


      if (!updatedUser) {
        return res.status(404).json({ message: "User not found." });
      }

      res.status(200).json({
        success: true,
        message: "Successfully updated user wish list",
        data: updatedUser,
      });
    }
    catch (error) {
      console.error("Error in UpdateWishList:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update user wish list",
        error: error.message || error,
      });
    }
  },
  ContactUs: async (req, res) => {
    console.log("this is the ContactUs function");
    const { email, subject, message } = req.body;


    try {
      const emailHTML = `
      <div  style="background-color: #f6f6f6; padding: 20px; font-family: Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          
          <!-- Logo -->
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="YOUR_LOGO_URL" alt="Company Logo" style="max-width: 150px;">
          </div>

          <!-- Content -->
          <div style="margin-bottom: 30px; color: #444444;">
            <h1 dir="rtl" style="color: #333333; font-size: 24px; margin-bottom: 20px;">הודעת צור קשר מהאתר </h1>
            <p dir="rtl" >אימייל המשתמש:  ${email},</p>
            <p dir="rtl">המשתמש שלך להודעה בנושא :${subject}</p>
            
      
            <p dir="rtl">מהות הפניה : </p>
            <p  dir="rtl">${message}</p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eeeeee; color: #666666; font-size: 12px;">
            <p>© 2024 Your Company Name. All rights reserved.</p>
            <p>Company Address, City, Country</p>
          </div>
        </div>
      </div>
    `;
      transporter.sendMail({
        from: process.env.MAIL_AUTH_USER, // sender address
        to: process.env.MAIL_AUTH_USER,
        subject: subject, // Subject line
        // text: `המשתמש `, // plain text body
        html: emailHTML, // html body
      });
    }
    catch (error) {
      console.log(error, "this is the error in the contact us function");
      res.status(500).json({
        success: false,
        message: "not Success send Email for Contact Us",
        error: error.message || error,
      });
    }




  },





}


