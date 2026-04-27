import mongoose from 'mongoose';

const mBountySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required:[true,"User is Required"]
  },
 
  monthlyBountyLink: {
    type: String,
    default: ""
  },
  expireAt: {
    type: Date,
  }

},{timestamps:true});

mBountySchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export const mBountyModel = mongoose.model("MBounty", mBountySchema);