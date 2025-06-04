import { Schema,model } from "mongoose";

const orders_Schema = new Schema({
   order_status:{
        type:String,
        enum:["חדש","בהכנה","הועבר למשלוח","הושלמה","מבוטלת"],
        default:"חדש"
    },
    order_shipment_address:{
        city:{
            type:String,
            required:false
        },
        street:{
            type:String,
            required:false
        },
        building_number:{
            type:String,
            required:false
        },
        aprtmernt_number:{
            type:String,
            required:false
        },
          postal_code: {
            type: Number,
        },
        
    },
    order_costumer_phone:{
        type:String,
        required:false
    },
    order_costumer_mail:{
        type:String,
        required:true
    },
    
    order_total_price:{
        type:Number,
        default:0
    },
    order_isPaid:{
        type:Boolean,
        default:false
    },
    order_user:{
        type:Schema.Types.ObjectId,
         ref:"Users"
        
    },
    order_NotRegisterPersone:{
        type:String,
        default:""
    },
    order_products:[
        
        {
            _id:{
                type: Schema.Types.ObjectId,  // חייב להיות מוגדר כ-ObjectId
                 ref: "Products"   // חייב להיות מוגדר איזה מודל הוא מפנה אליו
            },
            quantity:{
                type:Number,
                default:1
            },
         

        }
    ],
    order_shipment_Note:{
        type:String,
        default:""
    }



},{timestamps:true})
export default model('Orders',orders_Schema);