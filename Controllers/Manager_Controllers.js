import Manager_model from '../model/Manager_model.js';
import { compare, hash } from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import transporter from "../Service/Mail.js";





export default {

  //הפונקציות של המנהלים

  Login: async (req, res) => {

    try {
      const { manager_email, manager_password } = req.body
      // console.log("this is the manager_email", manager_email);
      // console.log("this is the manager_password", manager_password);
      // if (!manager_password || !manager_email)
      //   throw new Error("all fields required!");

      // if Email Exist
      const manager = await Manager_model.findOne({manager_email });
      // console.log("this is the manager", manager);

      // if(!manager.verifyEmail) throw new Error("You Must Verify to Email!!");
      if (!manager) throw new Error("manager Not Exist!");

      // if Password match
      const isMatch = await compare(manager_password, manager.manager_password);
      console.log("this is the isMatch", isMatch);

      if (!isMatch) throw new Error("Password or Email is not Valid!");

      manager.manager_password = "******";

      // Send manager Token For Experience with ReAuthenticate and send Cookie to manager.
      const token = jwt.sign({ ...manager }, process.env.JWT_SECRET_MANAGER, {
        expiresIn: 60 * 60 * 1,
      });
      console.log("this is the token", token);


      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 1,
      });

      //the finel response to the manager
      res.status(200).json({
        success: true,
        message: "Success Login manager",
        manager,
      });


    }

    catch (error) {
      res.status(401).json({
        success: false,
        message: "not Success Login manager",
        error: error.message || error,
      });
    }



  },
  Register: async (req, res) => {

    try {
      const { manager_email, manager_password } = req.body
      console.log("this is the manager_email", manager_email);
      console.log("this is the manager_password", manager_password);
      const manager = await Manager_model.create(req.body);
      
   

      //the finel response to the manager
      res.status(200).json({
        success: true,
        message: "Success Register User",
        manager,
      });



    }

    catch (error) {
      console.log(error);
      res.status(401).json({
        success: false,
        message: "not Success Register User",
        error: error.message || error,
      });
    }



  },
  authenticate: async (req, res) => {
    try {
      const { token } = req.cookies;
      const decode = jwt.verify(token, process.env.JWT_SECRET_MANAGER);
      if (!decode) throw new Error("Token Not Valid");
      req.user = decode;
      res.status(200).json({
        success: true,
        message: "Success Authenticate User",
        user: decode,
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
// console.log(email, "this is the email in forgot password");
    // Encoded the resetToken for validate user email later
    const refreshPasswordToken = crypto.randomBytes(20).toString("hex");

    const ResetPasswordToken = crypto
      .createHash("sha256")
      .update(refreshPasswordToken)
      .digest("hex");
console.log(ResetPasswordToken, "this is the ResetPasswordToken");
    // define how much long the token until expire
    const resetPasswordTokenExpiry = new Date(Date.now() + (1000 * 60 * 10)); // 10 mintues

    // Update Database user Document on resetToken
    await Manager_model.findOneAndUpdate(
      { manager_email:email },
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
            <a href="http://localhost:5173/manager/ResetPassword?email=${email}&token=${refreshPasswordToken}" style="background-color: #007bff; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          
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
    const {manager_password} = req.body;
console.log(email, token,manager_password, "this is the email and token and password");

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

      // console.log(hashedToken, "this is the hashedToken");
     const passwordHash = await hash(manager_password,10);
     console.log(passwordHash, "this is the passwordHash");
      const manager =  await Manager_model.updateOne(
      {
        manager_email: email,
        ResetPasswordToken: hashedToken,
        resetPasswordTokenExpiry: { $gt: Date.now() },
      },
      {
        $set:{
          manager_password:passwordHash,
          ResetPasswordToken: null,
          resetPasswordTokenExpiry: null
        }
      }
    );
    console.log(manager, "this is the manager after update"); 

    if (!manager.matchedCount) throw new Error("the request Expire");

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
   getallmanagers: async (req, res) => {
      
        try {
          const { page = 1, limit = 10 } = req.query;
          const count = await Manager_model.countDocuments();
          const isLimit = limit === 0 ? count : limit;
        // console.log("getAllCategory")
          const managers = await Manager_model.find()
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(isLimit)
          // .populate('category_SubCategories');
    
          res.status(200).json({
            success: true,
            message: "Success get all managers",
            data:managers,
            pages: Math.ceil(count / limit),
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: "not Success add managers",
            error: error,
          });
        }
      },

};