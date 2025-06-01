
//ייבוא ספריות
import express from 'express';
import {config} from "dotenv"
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoDB from './DB/connectMongo.js';



//תוספים
const app = express();
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173","http://localhost:5174",
         ,process.env.DASHBOARD_DOMAIN
        ,process.env.CLIENT_DOMAIN
    ],
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(cookieParser());
config();
mongoDB();


//ייבוא הראטורים
import UserRouter from "./Routers/Users_Router.js"
import ProductRouter from "./Routers/Products_Router.js"
import OrderRouter from "./Routers/Orders_Router.js"
import CartRouter from "./Routers/Cart_Router.js"
import CategoriesRouter from "./Routers/Categories_Router.js"
import ManagerRouter from "./Routers/Manager_Router.js"
import SubCategoriesRouter from "./Routers/SubCategories_Router.js"
import imagegalleryRouter from "./Routers/imagegallery_Router.js"
import paymentRouer from "./Routers/payment.Router.js"

//נקודות הקצה הראשיות

app.use('/Users', UserRouter);
app.use('/Managers', ManagerRouter);
app.use('/Products', ProductRouter);
app.use('/Categories', CategoriesRouter);
app.use('/SubCategories', SubCategoriesRouter);
app.use('/Carts', CartRouter);
app.use('/Orders', OrderRouter);
app.use('/imagegallery', imagegalleryRouter);
app.use('/payment',paymentRouer);




//הפעלת השרת
const port = process.env.PORT;
app.listen(port, () => console.log(`server is running on port ${port}`));
