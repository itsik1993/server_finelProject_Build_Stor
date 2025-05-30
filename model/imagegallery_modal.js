import { Schema,model } from "mongoose" ;

const image_gallery_Schema = new Schema({
    name:{
     type:String, 
     default:"Albom"

    },
    
    Albom: [String]
  }, { timestamps: true });

    


  




export default model("imagegallery", image_gallery_Schema);