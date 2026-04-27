import mongoose from 'mongoose';

const bountySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  redCode: {
    type: String,
    required: [true, "Red Packet Code id Required"],
  },
  dailyBountyLink: {
    type: String,
    default: ""
  },
  amout:{
    type:String
  },
  expireAt: {
    type: Date,
  }

},{timestamps:true});

bountySchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });


export const bountyModel = mongoose.model("Bounty", bountySchema);