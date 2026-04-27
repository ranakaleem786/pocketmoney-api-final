import mongoose from 'mongoose';

const dailyClaimedRecordSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  bountyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bounty",
    required: [true, "bounty Refrance is Required"]
  },
  binanceNickName: {
    type: String,
    required: [true, "binance NickName is Required"],
  },
  
},{timestamps:true});

dailyClaimedRecordSchema.index(
  { user: 1, bountyId: 1 },
  { unique: true }
);


export const dailyClaimedRecordModel = mongoose.model("DailyClaimedRecord", dailyClaimedRecordSchema);