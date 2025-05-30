import mongoose from "mongoose";

async function connectMongo() {
  try {
    const uri=process.env.MONGO_URI
    await mongoose.connect(uri)
      console.log("MongoDB connected");
  } catch (error) {
    console.log("MongoDB connection failed");
    console.log(error);
  }
}

export default connectMongo;