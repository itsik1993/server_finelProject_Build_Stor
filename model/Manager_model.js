import{Schema,model} from "mongoose"
import { hash } from 'bcrypt';
import { nanoid } from 'nanoid';    


const manager_Schema = new Schema({
manager_name: {
    type: String,
    // required: true,
    default:""
},
manager_lastname: {
    type: String,
    // required: true,
    default:""
},
manager_email: {
    type: String,
    required: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
    unique: true
},
manager_premission: {
    type: String,
    default: "Manager",
    required: true,
    enum: ["Admin", "Manager"]
},
manager_password:{
    type:String,
    required:true,
    min:5,
    default:"Admin123"
},
manager_first_login:{
    type:Boolean,
    default:true,
    required:true
},
   verifyEmail: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        default: nanoid()
    },
    ResetPasswordToken:{
        type:String
     },
     resetPasswordTokenExpiry:{
         type:Date
     },



}, { timestamps: true });

manager_Schema.pre("save",async function(next){
    this.manager_password = await hash(this.manager_password,10);
    next();
   })

export default model('Manager', manager_Schema);

