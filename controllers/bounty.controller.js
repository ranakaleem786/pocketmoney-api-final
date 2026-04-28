import { bountyModel } from "../models/bounty.model.js";
// import { bountyHistoryModel } from "../models/bountyHistory.model.js";
import { mBountyModel } from "../models/mBounty.model.js";
import { userModel } from "../models/user.model.js";
import { responseHandler } from "../utils/responseHandler.js";
import { dailyClaimedRecordModel } from '../models/dailyClaimedRecord.model.js'
import { claimedRewardCountModel } from "../models/claimedRewardCount.model.js";
import { bountyHistoryModel } from "../models/bountyHistory.model.js";

// export const createBounty = async (req, res) => {
//   try {
//     const userId = req.user?.id;
//     const { redCode, amout } = req.body;

//     // 🔒 Validation
//     if (!redCode) {
//       return responseHandler(res, 400, {}, "RedCode is required", false);
//     }

//     const user = await userModel.findById(userId);

//     if (!user) {
//       return responseHandler(res, 404, {}, "User not found", false);
//     }

//     if (user.poki < 500) {
//       return responseHandler(res, 403, {}, "Your are note Unauthorized for Create Bounty", false)
//     }


//     // 🔥 Check agar same redCode already exist karta hai
//     const existing = await bountyModel.findOne({ redCode });

//     if (existing) {
//       return responseHandler(res, 400, {}, "RedCode already exists", false);
//     }

//     const expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hour bad delete hoga

//     // ✅ Create new bounty
//     const bounty = await bountyModel.findOneAndUpdate(
//       { user: userId },
//       { expireAt, redCode, amout },
//       { returnDocument: "after", upsert: true }
//     );

//     return responseHandler(res, 201, bounty, "Bounty created successfully");
//   } catch (error) {
//     // 🔥 Duplicate error handle (extra safety)
//     if (error.code === 11000) {
//       return responseHandler(res, 400, {}, "RedCode must be unique", false);
//     }

//     return responseHandler(res, 500, error.message, `Internal server Error createBounty `, false);
//   }
// };


export const getAllBountes = async (req, res) => {
  try {
      const userId = req.user?.id;
    const visitorId = req.headers["visitor-id"];

    // console.log(userId)

    let claimedIds = [];

    // ✅ sirf tab query chalao jab user ya visitor ho
    if (userId || visitorId) {

      const query = [];

      if (userId) query.push({ user: userId });
      if (visitorId) query.push({ visitorId: visitorId });

      claimedIds = await bountyHistoryModel.distinct("bountyRef", {
        $or: query
      });
    }

    // 🔥 agar koi claim nahi → empty array → sab show hoga
    const allBountes = await bountyModel.find({
      _id: { $nin: claimedIds }
    }).sort({ createdAt: -1 });

    return responseHandler(res, 200, allBountes, "Bounties fetched");

  } catch (error) {
    return responseHandler(res, 500, error.message, "Error");
  }
};


// export const getAllBountes = async (req, res) => {
//   try {
//     const userId = req.user?.id || null;
//     const visitorId = req.headers["visitor-id"] || null;

//     // 🔥 claimed bounties nikaalo
//     const claimed = await bountyHistoryModel.find({
//       $or: [
//         userId ? { user: userId } : null,
//         visitorId ? { visitorId: visitorId } : null
//       ].filter(Boolean) // ❗ null remove karega
//     }).select("bountyRef");

//     const claimedIds = claimed.map((c) => c.bountyRef);

//     // 🔥 filter
//     const allBountes = await bountyModel.find({
//       _id: { $nin: claimedIds }
//     }).sort({ createdAt: -1 });

//     return responseHandler(res, 200, allBountes, "Filtered Bounties");

//   } catch (error) {
//     return responseHandler(res, 500, error.message, "Error");
//   }
// };


// export const getAllBountes = async (req, res) => {
//   try {
//     const userId = req.user?.id || null;
//     const visitorId = req.headers["visitor-id"]; // frontend se bhejna

//     // 🔥 user ne jo claim ki hain wo nikaalo
//     const claimed = await bountyHistoryModel.find({
//       $or: [
//         { user: userId },
//         { visitorId: visitorId }
//       ]
//     }).select("bountyRef");

//     if (claimed.length === 0){
//       const allBountes = await bountyModel.find()
//       .sort({ createdAt: -1 });

//       return responseHandler(res, 200, allBountes, " fetch all Bounties");

//     }

//     const claimedIds = claimed.map((c) => c.bountyRef);

//     // 🔥 filter lagao
//     const allBountes = await bountyModel.find({
//       _id: { $nin: claimedIds }
//     }).sort({ createdAt: -1 });

//     return responseHandler(res, 200, allBountes, "Filtered Bounties");

//   } catch (error) {
//     return responseHandler(res, 500, error.message, "Error");
//   }
// };

// export const getAllBountes = async (req, res) => {
//   try {
//     const allBountes = await bountyModel.find().sort({ createdAt: -1 });

//     if (allBountes.length === 0) {
//       return responseHandler(res, 404, {}, "Daily bountes Not Found", false)
//     }

//     return responseHandler(res, 200, allBountes, "Get All Bountes");

//   } catch (error) {
//     return responseHandler(res, 500, error.message, "Internal server Error Get All Bountes", false);
//   }
// };


export const getAllMonthlyBountes = async (req, res) => {
  try {
    const allBountes = await mBountyModel.find();

    if (allBountes.length === 0) {
      return responseHandler(res, 404, {}, "Monthly bountes Not Found", false)
    }

    return responseHandler(res, 200, allBountes, "Get All Monthly Bountes");

  } catch (error) {
    return responseHandler(res, 500, error.message, "Internal server Error Get All Monthly Bountes", false);
  }
};

export const dailyClaimedRecord = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { bountyId } = req.body;

    if (!userId || !bountyId) return

    const user = await userModel.findById(userId).select("-password");
    if (!user) {
      return responseHandler(res, 404, {}, "User Not Found", false);
    }

    const dailyBounty = await bountyModel.findById(bountyId);
    if (!dailyBounty) {
      return responseHandler(res, 404, {}, "Bounty Not Found", false);
    }

    const existDailyBounty = await dailyClaimedRecordModel.findOne({
      user: user._id,
      bountyId: dailyBounty._id,
    });

    if (existDailyBounty) {
      return responseHandler(
        res,
        403,
        {},
        "You already claimed this bounty",
        false
      );
    }

    // ✅ create record
    const claimedRecord = await dailyClaimedRecordModel.create({
      user: user._id,
      bountyId: dailyBounty._id,
      redCode: dailyBounty.redCode,
      device: dailyBounty.device,
      binanceNickName: user.binanceNickName,
    });

    // ✅ reward count
    const rewardCount = await claimedRewardCountModel.findOneAndUpdate(
      { user: user._id },
      {
        $inc: { rewardCount: 1 },
        $set: { expireAt: dailyBounty.expireAt },
      },
      {
        returnDocument: "after",
        upsert: true,
      }
    );

    return responseHandler(
      res,
      201,
      {
        ClaimedRecord: claimedRecord,
        RewardCount: rewardCount,
      },
      "Success"
    );

  } catch (error) {


    return responseHandler(
      res,
      500,
      {},
      `Internal Server Error ${error.message} `,
      false
    );
  }
};


export const getClaimedRewardCount = async (req, res) => {
  try {
    const userId = req.user?.id;

    const reward = await claimedRewardCountModel.findOne({
      user: userId,
    }).select("rewardCount");

    if (!reward) {
      return responseHandler(
        res,
        404,
        {},
        "No reward record found",
        false
      );
    }

    return responseHandler(
      res,
      200,
      { reward },
      "Reward count fetched successfully"
    );

  } catch (error) {
    return responseHandler(
      res,
      500,
      {},
      `Internal server error ${error.message}`,
      false
    );
  }
};


export const claimBounty = async (req, res) => {
  try {
    const { bountyId, visitorId } = req.body;
    const userId = req.user?.id || null;

    // ❌ duplicate claim check
    // const already = await bountyHistoryModel.findOne({
    //   bountyRef: bountyId,
    //   $or: [
    //     { user: userId },
    //     { visitorId: visitorId }
    //   ]
    // });

    // if (already) {
    //   return responseHandler(res, 400, {}, "Already claimed", false);
    // }

    const existDailyBounty = await bountyHistoryModel.findOne({
      user: userId,
      bountyRef: bountyId,
    });

    if (existDailyBounty) {
      return responseHandler(
        res,
        403,
        {},
        "You already claimed this bounty",
        false
      );
    }

    const bounty = await bountyModel.findById(bountyId);

    await bountyHistoryModel.create({
      user: userId,
      visitorId,
      bountyRef: bountyId,
      expireAt: bounty.expireAt
    });

    return responseHandler(res, 200, {}, "Claim success");

  } catch (error) {
    return responseHandler(res, 500, error.message, " internal server Error Claim Bounty",false);
  }
};