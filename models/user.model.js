import mongoose from 'mongoose';
import argon2 from "argon2";

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: [true, "User Name is Required"]
  },
  email: {
    type: String,
    required: [true, "Email is Required"],
    unique:true
  },
  password: {
    type: String,
    required: [true, "Password is Required"],
    minLength: [6, "Password must be at least 6 characters"]
  },
  binanceNickName: {
    type: String,
    required: [true, "Binance NickName is Required"],
    unique: [true,"Binance NickName is Allready Exist"]
  },
  profileImg:{
    type:String,
    default:"",
  },
  gender:{
    type: String,
    default:""
  },
  role:{
    type:String,
    enum:["user","admin"],
    default:"user"
  },
  balance:{
    type: Number,
    default: 0,
    min: 0,
  }

},{timestamps:true});


userSchema.pre("save", async function () {

  if (!this.isModified("password")) return;

  this.password = await argon2.hash(this.password);

});

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await argon2.verify(this.password, enteredPassword);
};


export const userModel = mongoose.model("User",userSchema);