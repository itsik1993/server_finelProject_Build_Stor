import { createTransport } from "nodemailer";
import { config } from "dotenv";
config();



const transporter = createTransport({
    service:"gmail",
    auth:{
        pass:process.env.MAIL_AUTH_PASS,
        user:process.env.MAIL_AUTH_USER
    }
});

export default transporter;