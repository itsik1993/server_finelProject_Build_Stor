import { createOrder, capturePayment } from "../Service/payment.js";
import  { Router } from "express"
const router=Router();

router.post("/create-order",async (req,res) => {
    const {sendCart}=req.body
    console.log(sendCart,"מתוך השרת")
    try {
      const orderId = await createOrder(sendCart);
      res.status(200).json({orderId})
      console.log(orderId,"זה מה שחיכיתי לו")
    } catch (error) {
        res.status(500).json({message:false})
    }
});

router.post("/capture-order",async(req,res) => {
try {
    const {orderId} = req.body;

   const captureData = await capturePayment(orderId);
   res.status(200).json(captureData)
} catch (error) {
    console.log(error)
    res.status(500).json({message:false})

}
})

export default router