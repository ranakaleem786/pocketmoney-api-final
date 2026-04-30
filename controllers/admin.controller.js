import { userModel } from "../models/user.model.js";
import { responseHandler } from "../utils/responseHandler.js";
import { bountyModel } from '../models/bounty.model.js';
import { mBountyModel } from "../models/mBounty.model.js";
import { paymentMethodModel } from '../models/paymentMethod.model.js'
import { dailyClaimedRecordModel } from "../models/dailyClaimedRecord.model.js";
import { sendEmail } from '../service/sendEmail.service.js'
import cloudinary from "../config/cloudinary.js";
import fs from "fs";
import path from "path";
// import XLSX from "xlsx";
import { Parser } from "json2csv";
import { withdrawalModel } from "../models/withdrawal.mode.js";
import { withdrawalApprovedTemplate, withdrawalRejectedTemplate } from "../utils/htmlTemlate.js";
// import config from "../config/config.js";


export const getAllUser = async (req, res) => {
  try {
    // 🔐 Admin check
    if (req.user?.role !== "admin") {
      return responseHandler(res, 403, {}, "Access denied", false);
    }

    const users = await userModel.find().select("-password");

    return responseHandler(
      res,
      200,
        users,
      "All users fetched successfully"
    );
  } catch (error) {
    return responseHandler(
      res,
      500,
      {},
      `Internal server error get All Users: ${error.message}`,
      false
    );
  }
};


export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 🔐 admin check
    if (req.user?.role !== "admin") {
      return responseHandler(res, 403, {}, "Access denied", false);
    }

    const user = await userModel.findById(id);

    if (!user) {
      return responseHandler(res, 404, {}, "User not found", false);
    }

    await userModel.findByIdAndDelete(id);

    return responseHandler(res, 200, {}, "User deleted successfully");
  } catch (error) {
    return responseHandler(res, 500, {}, error.message, false);
  }
};


export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, email, newPassword, role, balance } = req.body;

    const parsedBalance = Number(balance);

    const user = await userModel.findById(id);

    if (!user) {
      return responseHandler(res, 404, {}, "User not found", false);
    }

    // 🔐 Allow: admin OR own account
    if (req.user?.role !== "admin") {
      return responseHandler(res, 403, {}, "Access denied", false);
    }

    if (userName) user.userName = userName;
    if (email) user.email = email;
    if (newPassword) user.password = newPassword;
    if (role) user.role = role;
    if (parsedBalance) user.balance += parsedBalance;

    await user.save();

    return responseHandler(
      res,
      200,
      user,
      "User updated successfully"
    );
  } catch (error) {
    return responseHandler(res, 500, {}, error.message, false);
  }
};



// bounty
export const createBounty = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role
    const { redCode, dailyBountyLink, device } = req.body;

    // 🔐 Allow: admin
    if (role !== "admin") {
      return responseHandler(res, 403, {}, "Access denied", false);
    }

    // const user = await userModel.findById(userId).select("userName")

    // 🔒 Validation
    if (!redCode) {
      return responseHandler(res, 400, {}, "RedCode is required", false);
    }

    const expireAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hour bad delete hoga

    // ✅ Create new bounty
    const bounty = await bountyModel.create({
      user:userId,
      expireAt,
      redCode,
      dailyBountyLink,
      device
      // expireAt automatically set hoga (Date.now + 24h TTL)
    });

    return responseHandler(res, 201, bounty , "Admin Bounty created successfully");
  } catch (error) {

    return responseHandler(res, 500, {}, error.message, false);
  }
};

export const updateBounty = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;

    const { bountyId } = req.params;
    const { redCode, dailyBountyLink, device, extendDays } = req.body;

    // 🔐 Only admin allowed
    if (role !== "admin") {
      return responseHandler(res, 403, {}, "Access denied", false);
    }

    // 🔍 Find bounty
    const bounty = await bountyModel.findById(bountyId);

    if (!bounty) {
      return responseHandler(res, 404, {}, "Bounty not found", false);
    }

    // ✏️ Update only provided fields
    if (redCode !== undefined) bounty.redCode = redCode;
    if (dailyBountyLink !== undefined) bounty.dailyBountyLink = dailyBountyLink;
    if (device !== undefined) bounty.device = device;

    // ⏳ Expire update logic
    if (extendDays !== undefined) {
      // agar custom date bheji hai
      bounty.expireAt = new Date(
        bounty.expireAt.getTime() +
        extendDays * 24 * 60 * 60 * 1000
      );
    }

    await bounty.save();

    return responseHandler(res, 200, bounty, "Bounty updated successfully");

  } catch (error) {
    return responseHandler(res, 500, {}, error.message, false);
  }
};

export const getAllUserBountesOnly = async (req, res) => {
  try {
    const role = req.user?.role;

    // 🔐 Admin check
    if (role !== "admin") {
      return responseHandler(res, 403, {}, "Access denied", false);
    }

    const bounties = await bountyModel.find()
      .populate("user", "userName role");

    const filtered = bounties.filter(
      b => b.user && b.user.role === "user"
    );
    
    if (filtered.length === 0) {
      return responseHandler(
        res,
        404,
        [],
        "No user bounties found",
        false
      );
    }

    return responseHandler(res, 200, filtered, "All user bounties fetched");
  } catch (error) {
    return responseHandler(
      res,
      500,
      error.message,
       "Internal server error getAllUserBountesOnly",
      false
    );
  }
};


export const getAllAdminBountesOnly = async (req, res) => {
  try {
    const role = req.user?.role;

    // 🔐 Admin check
    if (role !== "admin") {
      return responseHandler(res, 403, {}, "Access denied", false);
    }

    const bounties = await bountyModel.find()
      .populate("user", "userName role");

    const filtered = bounties.filter(
      b => b.user && b.user.role === "admin"
    );

    if (filtered.length === 0) {
      return responseHandler(
        res,
        404,
        [],
        "No admin bounties found",
        false
      );
    }

    return responseHandler(
      res,
      200,
      filtered,
      "All Admin bounties fetched"
    );
  } catch (error) {
    return responseHandler(
      res,
      500,
      error.message,
      "Internal server error getAllAdminBountesOnly ",
      false
    );
  }
};

export const deleteBounty = async (req, res) => {
  try {
    const role = req.user?.role;
    const { id } = req.params;

    // 🔐 Only admin allowed (agar tum chaho to user allow bhi kar sakte ho)
    if (role !== "admin") {
      return responseHandler(res, 403, {}, "Access denied", false);
    }

    // 🔎 Check bounty exists
    const bounty = await bountyModel.findById(id);

    if (!bounty) {
      return responseHandler(res, 404, {}, "Bounty not found", false);
    }

    // 🗑️ Delete bounty
    await bountyModel.findByIdAndDelete(id);

    return responseHandler(res, 200, {}, "Bounty deleted successfully");
  } catch (error) {
    return responseHandler(res, 500, {}, error.message, false);
  }
};

// Monthly Bounty
export const createMBounty = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role
    const { monthlyBountyLink } = req.body;

    // 🔐 Allow: admin
    if (role !== "admin") {
      return responseHandler(res, 403, {}, "Access denied", false);
    }

    const expireAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // delete in 30 days

    // ✅ Create new monthly bounty
    const mBounty = await mBountyModel.create({
      user: userId,
      monthlyBountyLink, expireAt
      // expireAt automatically set hoga (Date.now + 30d TTL)
    });

    return responseHandler(res, 201, mBounty, "Admin Monthly Bounty created successfully");
  } catch (error) {

    return responseHandler(res, 500, error.message, "Internal Server Error Create Monthly Bounty ", false);
  }
};

export const getAllAdminMBountesOnly = async (req, res) => {
  try {
    const role = req.user?.role;

    // 🔐 Admin check
    if (role !== "admin") {
      return responseHandler(res, 403, {}, "Access denied", false);
    }

    // 🔥 Populate + filter admins only
    const bounties = await mBountyModel
      .find()
      .populate({
        path: "user",
        match: { role: "admin" }, // 👈 sirf Admins
        select: "userName role"
      });

    // ❌ null (User wale) remove
    const filtered = bounties.filter(b => b.admin !== null);

    if (filtered.length === 0) {
      return responseHandler(
        res,
        404,
        [],
        "No Admin bounties found",
        false
      );
    }


    return responseHandler(
      res,
      200,
      filtered,
      "All Admin monthly bounties fetched"
    );
  } catch (error) {
    return responseHandler(
      res,
      500,
      error.message,
      "Internal server error getAllAdminMBountesOnly ",
      false
    );
  }
};


export const deleteMBounty = async (req, res) => {
  try {
    const role = req.user?.role;
    const { id } = req.params;

    // 🔐 Only admin allowed (agar tum chaho to user allow bhi kar sakte ho)
    if (role !== "admin") {
      return responseHandler(res, 403, {}, "Access denied", false);
    }

    // 🔎 Check bounty exists
    const bounty = await mBountyModel.findById(id);

    if (!bounty) {
      return responseHandler(res, 404, {}, "Monthly Bounty not found", false);
    }

    // 🗑️ Delete bounty
    await mBountyModel.findByIdAndDelete(id);

    return responseHandler(res, 200, {}, "Monthly Bounty deleted successfully");
  } catch (error) {
    return responseHandler(res, 500, error.message,"Internal server error Monthly Bounty deleted " , false);
  }
};


export const getAllDailyClaimedRecord = async (req,res) => {
  try {

    const role = req?.user?.role

    // 🔐 Allow: admin
    if (role !== "admin") {
      return responseHandler(res, 403, {}, "Access denied", false);
    }

    const claimedRecord = await dailyClaimedRecordModel.find();

    if (claimedRecord.length === 0) {
      return responseHandler(
        res,
        404,
        [],
        "No claimed records found",
        false
      );
    }

    return responseHandler(res, 200, { claimedRecord }," claimedRecord successfuly fetched")

  } catch (error) {
    return responseHandler(res, 404, {}, `internal server error ${error.message}`,false)
  }
};

export const deleteDailyClaimedRecord = async (req,res) => {
  try {

    const role = req?.user?.role

    // 🔐 Allow: admin
    if (role !== "admin") {
      return responseHandler(res, 403, {}, "Access denied", false);
    }

    const bountyId = req.params;

    if (!bountyId) {
      return responseHandler(res, 404, {}, "claimedRecord id not found", false)
    }

    const claimedRecord = await dailyClaimedRecordModel.findByIdAndDelete(bountyId.id);

    

    return responseHandler(res, 200, { claimedRecord }," claimedRecord successfuly Delete")

  } catch (error) {
    return responseHandler(res, 404, {}, `internal server ${error.message}`,false)
  }
};

export const deleteAllDailyClaimedRecord = async (req, res) => {
  try {
    const { confirmText } = req.body;

    const role = req?.user?.role

    // 🔐 Allow: admin
    if (role !== "admin") {
      return responseHandler(res, 403, {}, "Access denied", false);
    }

    // ✅ confirmation check
    if (confirmText !== "DELETE ALL") {
      return responseHandler(
        res,
        400,
        {},
        "Type 'DELETE ALL' to confirm",
        false
      );
    }

    // ✅ delete all records
    const result = await dailyClaimedRecordModel.deleteMany({});

    return responseHandler(
      res,
      200,
      { deletedCount: result.deletedCount },
      "All claimed records deleted successfully"
    );

  } catch (error) {
    return responseHandler(
      res,
      500,
      {},
      `Internal Server Error ${error.message}`,
      false
    );
  }
};

// pymentmethod
export const withdrawalApproval = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // 🔐 Admin check
    if (req.user?.role !== "admin") {
      return responseHandler(res, 403, {}, "Access denied", false);
    }

    // ❗ Validate status
    const allowedStatus = ["approved", "rejected"];
    if (!allowedStatus.includes(status)) {
      return responseHandler(res, 400, {}, "Invalid status", false);
    }

    // 🔍 Find withdrawal
    const withdrawal = await withdrawalModel.findById(id);

    if (!withdrawal) {
      return responseHandler(res, 404, {}, "Withdrawal not found", false);
    }

    // 🚫 Prevent double update
    if (withdrawal.status !== "pending") {
      return responseHandler(
        res,
        400,
        {},
        `Already ${withdrawal.status}`,
        false
      );
    }

    const user = await userModel.findById(withdrawal.user);

    if (status === "rejected") {
      user.balance += withdrawal.amount;
      const rejectApproval = await user.save();
      withdrawal.status = status;
      await withdrawal.save();

      const html = withdrawalRejectedTemplate(
        user.userName,
        withdrawal.amount,
        "Invalid account details"
      );

      await sendEmail(user.email,"Withdrawal Rejected ❌",
        html);

      return responseHandler(
        res,
        200,
        { withdrawal },
        "Withdrawal status updated successfully"
      );
    }

    // ✅ Update status
    withdrawal.status = status;
    await withdrawal.save();

    const html = withdrawalApprovedTemplate(user.userName, withdrawal.amount);

    await sendEmail(user.email,"Withdrawal Approved 🎉",
      html);

    return responseHandler(
      res,
      200,
      { withdrawal },
      "Withdrawal status updated successfully"
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


export const getAllWithdrawals = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return responseHandler(res, 403, {}, "Access denied", false);
    }

    const withdrawals = await withdrawalModel
      .find()
      .populate("user", "userName email balance")
      .sort({ createdAt: -1 });

    const withdrawalsWithPayment = await Promise.all(
      withdrawals.map(async (w) => {
        const paymentMethod = await paymentMethodModel.findOne({
          user: w.user._id,
        });

        return {
          ...w.toObject(),
          paymentMethod,
        };
      })
    );

    return responseHandler(
      res,
      200,
      { withdrawals: withdrawalsWithPayment },
      "All withdrawals fetched successfully"
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


export const exportCSVToCloudinary = async (req, res) => {
  try {
    const data = await dailyClaimedRecordModel.find().lean();

    if (!data.length) {
      return responseHandler(res, 404, [], "No data found", false);
    }

    // ✅ Clean data
    const cleanData = data.map((item) => ({
      user: item.user,
      bountyId: item.bountyId,
      binanceNickName: item.binanceNickName,
      createdAt: item.createdAt,
    }));

    const parser = new Parser();
    const csv = parser.parse(cleanData);

    // 🔥 FIX: Vercel-safe temp directory
    const dir = "/tmp";

    const fileName = `claimed-${Date.now()}.csv`;
    const filePath = path.join(dir, fileName);

    // 💾 write in temp (NOT project folder)
    fs.writeFileSync(filePath, csv);

    // ☁️ upload to cloudinary
    const upload = await cloudinary.uploader.upload(filePath, {
      resource_type: "raw",
      folder: "pocket-money/claimed",
    });

    // 🗑️ cleanup temp file
    fs.unlinkSync(filePath);

    return responseHandler(
      res,
      200,
      {
        url: upload.secure_url,
        public_id: upload.public_id,
      },
      "CSV exported & uploaded successfully"
    );

  } catch (error) {
    return responseHandler(
      res,
      500,
      {},
      `Export error ${error.message}`,
      false
    );
  }
};
