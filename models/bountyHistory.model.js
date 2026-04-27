import mongoose from 'mongoose';

const bountyHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  visitorId: {
    type: String,
    default: null
  },
  bountyRef: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bounty",
    required: true
  },
  expireAt: {
    type: Date
  }
}, { timestamps: true });

bountyHistorySchema.index(
  { user: 1, bountyRef: 1 },
  { unique: true }
);

bountyHistorySchema.index(
  { visitorId: 1, bountyRef: 1 },
  { unique: true, partialFilterExpression: { visitorId: { $type: "string" } } }
);

bountyHistorySchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export const bountyHistoryModel = mongoose.model("BountyHistory", bountyHistorySchema);