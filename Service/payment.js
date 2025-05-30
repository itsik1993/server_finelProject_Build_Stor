import axios from 'axios';
import {config} from "dotenv"
config();



async function generateAccessToken() {
  try {
    const { data } = await axios({
      url: "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      method: "POST",
      data: "grant_type=client_credentials",
      auth: {
        username: process.env.PAYPAL_CLIENT_ID,
        password: process.env.PAYPAL_SECRET,
      },
    });
    console.log(data)
    return data.access_token;
  } catch (error) {
    console.log(error);
  }
}



export const createOrder = async (sendCart) => {
// const arrt=sendCart.map((item) => ({
//     name: item.product_name,
//     quantity: item.quantity,
//     // category: "PHYSICAL_GOODS",
//     unit_amount: {
//       currency_code: "ILS",
//       value:Number(item.product_costumer_price).toFixed(2),
//     },
//   }))

//   const b=sendCart.reduce((acc, item) => acc + item.product_costumer_price * item.quantity, 0).toFixed(2)
//   console.log(arrt," בוא תבדוק אותי")
//   console.log(String(b)," bbbb בוא תבדוק אותי")

    
    try {
        // console.log(sendCart,"עגלה מספר 2")
      const access_token = await generateAccessToken();
  console.log(access_token)
      const { data } = await axios({
        url: "https://api-m.sandbox.paypal.com/v2/checkout/orders",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        data: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              // represent the items in the sendCart
              items: sendCart.map((item) => ({
                name: item.product_name,
                quantity: item.quantity,
                // image_url:item.product_image||"",
                image_url:item.product_image,
                sku:item._id,
                // category: "PHYSICAL_GOODS",
                unit_amount: {
                  currency_code: "ILS",
                  value:Number(item.product_costumer_price).toFixed(2),
                },
              })),
              // represent the Total Price
              amount: {
                currency_code: "ILS",
                value: Number(sendCart.reduce((acc, item) => acc + item.product_costumer_price * item.quantity, 0)).toFixed(2),
                breakdown: {
                  item_total: {
                    currency_code: "ILS",
                    value: Number(sendCart.reduce((acc, item) => acc + item.product_costumer_price * item.quantity, 0)).toFixed(2) // This should match the sum of all items
                  }, 
                },
              },
            },
          ],
          application_context: {
            shipping_preference: "NO_SHIPPING",
            // shipping_preference: "SHIPPING",
            // shipping_preference: "PICKUP_IN_STORE",
            user_action: "PAY_NOW",
            brand_name: "project",
            // return_url:"שולח אותכם לכתובת שבחרתם"
            // cancel_url:"במידה וביטלתם שולח אותכם לכתובת שבחרתם"
          },
        }),
      });
      // save data for user still dont payed;
      console.log(data,"הבדיקה החדשה")
      return data.id;
    } catch (error) {
      console.log(error);
    //   console.log("אתה בשגיאה");
    }
    // try {
    //     const access_token = await generateAccessToken();
    
    //     const { data } = await axios({
    //       url: "https://api-m.sandbox.paypal.com/v2/checkout/orders",
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //         Authorization: `Bearer ${access_token}`,
    //       },
    //       data: JSON.stringify({
    //         intent: "CAPTURE",
    //         purchase_units: [
    //           {
    //             amount: {
    //               currency_code: "ILS",
    //               value: "49.00",
    //             },
    //           },
    //         ],
    //         application_context: {
    //           shipping_preference: "NO_SHIPPING",
    //           user_action: "PAY_NOW",
    //           brand_name: "nethanel love paypal",
    //           // return_url:"שולח אותכם לכתובת שבחרתם"
    //           // cancel_url:"במידה וביטלתם שולח אותכם לכתובת שבחרתם"
    //         },
    //       }),
    //     });
    //     return data.id;
    //   } catch (error) {
    //     console.log(error);
    //   }
  };


  
  export const capturePayment = async (orderId) => {
    try {
      const access_token = await generateAccessToken();
  
      const { data } = await axios({
        url: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            `Bearer ${access_token}`,
        },
      });
      console.log(data , "מאמין שמידע סופי ")
      // save data in db
      if(data.status === "COMPLETED") {
        // save data in db
      }
  
      return data.id;
    } catch (error) {
      console.log(error);
    }
  };