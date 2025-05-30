import mongoose, {Schema,model}  from "mongoose";

const categories_Schema = new Schema({
    category_name: {
        type: String,
        required: true,
        unique: true
        
    },
    category_image: {
        type: String,
        // required: true
    },
    category_description: {
        type: String,
        required: true
    },
    category_SubCategories: [
        {
            ref:"SubCategories",
            type:mongoose.Schema.Types.ObjectId
        }
    ]


},{timestamps:true})

export default model('Categories',categories_Schema);

