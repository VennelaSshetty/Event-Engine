import mongoose from "mongoose";
import dotenv from "dotenv";
import ApiKey from "../models/ApiKey.js";
import generateApiKey from "../utils/generateApiKey.js";

dotenv.config(); 

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

async function createKey() {
  const key = generateApiKey();

  const apiKey = new ApiKey({
    key,
    appName: "FoodApp",
  });

  await apiKey.save();

  console.log("API Key:", key);

  process.exit();
}

createKey();