import mongoose,{ Schema, model } from 'mongoose';
import { hash } from 'bcrypt';
import { nanoid } from 'nanoid';



const users_Schema = new Schema({
    user_firstname: {
        type: String,
        required: true
    },
    user_lastname: {
        type: String,
        required: true
    },

    user_email: {
        type: String,
        required: true,
        match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        unique: true,
    },
    user_password: {
        type: String,
        min: 5,
        required: false
    },

    // איך נרשם אם גוגל או מייל -לבדוק את החלק של ההרשמה       
    user_address: {
        user_city: {
            type: String,
        },
        user_street: {
            type: String,
        },
        user_Bilding_number: {
            type: Number,
        },
        user_apartment_number: {
            type: Number,
        },
        user_postal_code: {
            type: Number,
        },
    },
    user_phone_number: {
        type: String,
        match: /^[0-9]{10}$/,
    },
    user_premission: {
        type: String,
        default: "Regular",
        required: true,
        // enum: ["Admin", "Manager", "Regular"]
    },
    user_orders_history: [
        {
            type:Schema.Types.ObjectId,
            ref:"Orders"

        }
    ],
    user_whishlist: [
        {
            type:Schema.Types.ObjectId,
            ref:"Products"
            // התייחסומות למוצרים מערך של מוצרים

        }
    ],
    user_shopping_cart: [
        {
          _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Products' },
          quantity: { type: Number, default: 1 }
        }
      ],
    SignUpProvider: {
        // to check if the user sign up with google or email, if he sign up with google we will not send him a verification email and 
        // we will not ask him to enter a password, this defult will be "google"
        type: String,
        default: "Credential",
    },
    verifyEmail: {
        //to check if the user verify his email
        type: Boolean,
        default: false,
    },
    verificationToken: {
        // the token that we send to the user to verify his email
        type: String,
        default: nanoid()
    },
    ResetPasswordToken:{
        // if the user forget his password we send him a token to reset his password
        type:String
     },
     resetPasswordTokenExpiry:{
        // the expiry date of the token that we send to the user to reset his password
         type:Date
     },
     replacementEmail: {
        // if the user want to change his email we will send him a token to verify his new email
        type: String,
        default: null
     },


}, { timestamps: true });


users_Schema.pre("save", async function (next) {
    if(this.SignUpProvider==="Credential"){
        this.user_password = await hash(this.user_password, 10);
    }
    next();
});

export default model('Users', users_Schema);