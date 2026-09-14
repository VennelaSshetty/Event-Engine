import mongoose from "mongoose";
import config from "./env.js";

const connectDB = async () => {
  try {

    // await mongoose.connect(config.mongoUri);

    await mongoose.connect(config.mongoUri, {
      maxPoolSize: 100,
      minPoolSize: 10
    });
  
    console.log("MongoDB Connected");

  } catch (error) {

    console.log(error);

    process.exit(1);
  }
};

export default connectDB;