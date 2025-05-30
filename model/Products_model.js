import mongoose, { Schema,model } from "mongoose" ;


const products_Schema = new Schema({

    product_name: {
        type: String,
        required: true
    },

product_barcode:[ {
    type: Number,
    // required: true,
    unique: false
}],
product_mkt:{
    type: String,
    required: false,
    unique: true

},
product_costumer_price: {
    type: Number,
    required: true
}, 
product_buy_price: {
    type: Number,
    required: false
}, 
product_originalPrice: {
    type: Number,
    required: false
},
product_badge: {
    type: String,
    required: false,
    default: "חדש"
},
// product_discount: {
//     type: Number,
//     required: false
//האם אני רוצה תת סכמה של מבצעים ואז נותן לכל מוצר מספר מבצע והוא משתתף?
// },
product_category:[ {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Categories",
  }],
  product_Subcategory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategories",
  }],    
product_description: {
    type: String,
    required: true
},  
product_details: {
    type: String,
    // required: true
},  
product_image: {
    type: String,
    // required: true,
    default:""
},
product_image_gallery: [
   
    //- האם צריך אובייקט מערך של תמונות
],
product_stock: {
    type: Number,
    required: true,
    default: 0
},
product_showInStore: {
    type: Boolean,
    required: true,
    default: true
},
product_action_history: [
    {
    //מערך של אובייקטים, יביא לי את השם משתמש + להוסיף מאפיין לאובייקט של סוג הפעולה שבוצע

    }
],



},{timestamps:true})
export default model("Products", products_Schema);