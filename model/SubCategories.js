import  {Schema,model}  from "mongoose";

const SubCategories_Schema = new Schema({


Subcategory_name: {
    type: String,
    required: false,
    unique: true
},
Subcategory_image: {
    type: String,
    // required: false
},
Subcategory_description: {
    type: String,
    required: true
}
},{timestamps:true})


export default model('SubCategories',SubCategories_Schema);
