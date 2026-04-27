import mongoose from 'mongoose';

const claimedRewardCountSchema = new mongoose.Schema({
  user: {
     type: mongoose.Schema.Types.ObjectId,
     ref: "User",
     required: true
   },
  rewardCount:{
    type:Number,
    default:0,
    min:0,
  },
  expireAt: {
    type: Date,
  }
},{timestamps:true});



claimedRewardCountSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });


export const claimedRewardCountModel = mongoose.model("ClaimedRewardCount",claimedRewardCountSchema);