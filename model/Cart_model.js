import{Schema,model} from "mongoose";

const cart_Schema = new Schema({  

cart_products:[
    {
        product_id:{
            type:Schema.Types.ObjectId,
            ref:"Products",
            required:true
        },
        product_quantity:{
            type:Number,
            default:1
        },
        product_price:{
            type:Number,
            default:0
        }
    }],
    cart_total_price:{
        type:Number,
        default:0

    }


  }, { timestamps: true });

export default model('Cart', cart_Schema);