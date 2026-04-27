import config from "../config/config.js"
import mongoose from "mongoose";

const connectDB = async ()=>{
try {
  mongoose.connect(config.mongoURI);
  console.log("db connection is established");
} catch (error) {
  console.log("db connection can't be established");
}
};

export default connectDB;