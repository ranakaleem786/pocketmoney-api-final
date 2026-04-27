import { adminWithdrawalRequestTemplate, resetPasswordTemplate, withdrawalRequestTemplate } from "../utils/htmlTemlate.js";
import config from "../config/config.js";
import { userModel } from "../models/user.model.js";
import { responseHandler } from '../utils/responseHandler.js'
import { generateToken, resetPasswordToken, verifyResetToken } from "../utils/token.js";
import { sendEmail } from '../service/sendEmail.service.js'
import { verifyPassword } from "../utils/hash.js";
import { withdrawalModel } from "../models/withdrawal.mode.js";
import { paymentMethodModel } from "../models/paymentMethod.model.js";

const isProduction = config.nodeEnv === "production";

export const register = async (req, res) => {
  try {
    const { userName, email, password, binanceNickName } = req.body;

    if (!userName || !email || !password || !binanceNickName) {
      return responseHandler(res, 403, {}, "All Fields are Required", false);
    }

    const userExist = await userModel.findOne({ email });

    if (userExist) {
      return responseHandler(res, 409, {}, "User already exists", false);
    }

    // if (userExist.binanceNickName) {
    //   return responseHandler(res, 409, {}, "Binance NickName is Allready Exist", false);
    // }


    const user = await userModel.create({
      userName,
      email,
      password,
      binanceNickName
    });

    return responseHandler(res, 201, { user }, `User successfully Created `);

  } catch (error) {
    return responseHandler(res, 500, { error }, "internal server error Craete User", false);
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return responseHandler(res, 400, {}, "Email and password are required", false);
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return responseHandler(res, 401, {}, "Invalid email or password", false);
    }

    const comparePassword = await verifyPassword(password, user.password);

    if (!comparePassword) {
      return responseHandler(res, 401, {}, "Invalid email or password", false);
    }



    const token = generateToken(user._id, user.role);


    return responseHandler(
      res,
      200,
      { user },
      `Login successful   `,
      true,
      [
        {
          name: "Token",
          value: token,
          options: {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          },
        },
      ]
    );

  } catch (error) {
    return responseHandler(res, 500, {}, `internal server error ${error.message}`, false);
  }
};

export const logout = async (req, res) => {

  try {
    return responseHandler(
      res,
      200,
      {},
      "Logout successful",
      true,
      [
        {
          name: "Token",
          value: "",
          options: {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 0, // cookie expire immediately
          },
        },
      ]
    );
  } catch (error) {
    return responseHandler(
      res,
      500,
      {},
      `internal server error logout ${error.message}`,
      false
    );
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return responseHandler(res, 404, {}, "User not found", false);
    }

    const token = resetPasswordToken(user._id, "10m");

    const resetLink = `${config.frontendUrl}/reset-password?token=${token}`;

    const html = resetPasswordTemplate(user.userName, resetLink)

    await sendEmail(email, "Reset Password", html);


    return responseHandler(res, 200, {}, "Reset link sent to email");
  } catch (error) {
    return responseHandler(res, 500, {}, error.message, false);
  }
};


export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    const decoded = verifyResetToken(token);

    const user = await userModel.findById(decoded.id);

    if (!user) {
      return responseHandler(res, 404, {}, "User not found", false);
    }

    user.password = newPassword;
    const save = await user.save();

    return responseHandler(res, 200, { save }, "Password reset successful");
  } catch (error) {
    return responseHandler(res, 400, {}, "Invalid or expired token", false);
  }
};


export const userUpdate = async (req, res) => {
  try {
    const { userName, password, gender } = req.body;

    const userId = req.user?.id;

    const user = await userModel.findById(userId);

    if (!user) {
      return responseHandler(res, 404, {}, "User Not Found", false);
    }

    if (userName !== undefined) user.userName = userName;

    if (password !== undefined) user.password = password;

    if (gender !== undefined) user.gender = gender;


    const save = await user.save();


    return responseHandler(
      res,
      200,
      { user: save },
      "User updated successfully",
    );

  } catch (error) {
    return responseHandler(
      res,
      500,
      {},
      `internal server error user edit: ${error.message}`,
      false
    );
  }
};

export const findMe = async (req, res) => {
  try {
    const userId = req.user?.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return responseHandler(res, 404, {}, "User Not Found", false);
    }

    return responseHandler(res, 200, user, "User Find Successfully")

  } catch (error) {
    return responseHandler(res, 500, error.message, "Internal server Error findMe", false);
  }
};

export const pymentMethodAddEdit = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { methodType, accountNumber, accountHolderName } = req.body;

    const user = await userModel.findById(userId);
    if (!user) {
      return responseHandler(res, 404, {}, "user not found", false);
    }
    if (!methodType || !accountNumber || !accountHolderName) {
      return responseHandler(res, 404, {}, "Filed the paymet details ", false);
    }

    const paymentMethod = await paymentMethodModel.findOneAndUpdate(
      { user: user._id },
      {
        $set: { methodType, accountNumber, accountHolderName, user: userId },
      },
      {
        returnDocument: "after",
        upsert: true,
      }
    );

    // const paymentMethod = await paymentMethodModel.create({
    //   user: userId,
    //   methodType,
    //   accountNumber
    // });

    return responseHandler(res, 201, { paymentMethod }, "PaymentMethod Successfully Add ");

  } catch (error) {
    return responseHandler(res, 404, {}, `internal server Error ${error.message}`, false);
  }
};

// controller (example)
export const getPaymentMethod = async (req, res) => {
  try {
    const userId = req.user?.id;

    const method = await paymentMethodModel.findOne({ user: userId }).lean();

    return responseHandler(
      res,
      200,
      method || null, // 👈 direct object ya null
      "OK"
    );
  } catch (e) {
    return responseHandler(res, 500, {}, e.message, false);
  }
};


export const withdrawalReq = async (req, res) => {
  try {
    const userId = req.user?.id;
    let { amount } = req.body;

    amount = Number(amount);

    // ✅ Validate amount
    if (!amount || amount <= 0) {
      return responseHandler(res, 400, {}, "Invalid amount", false);
    }

    if (amount < 100) {
      return responseHandler(res, 400, {}, "Minimum withdrawal is 100", false);
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return responseHandler(res, 404, {}, "User not found", false);
    }

    const payment = await paymentMethodModel.findOne({ user: userId })

    console.log(payment)
    console.log(userId)

    if (!payment) {
      return responseHandler(res, 404, {}, "payment method not found", false);
    }

    // ✅ Check sufficient balance
    if (user.balance < amount) {
      return responseHandler(res, 400, {}, "Insufficient balance", false);
    }


    const expireAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // delete in 15 days

    // ✅ Create withdrawal request
    const withdrawal = await withdrawalModel.create({
      user: user._id,
      amount,
      expireAt
    });

    // ✅ Deduct balance
    user.balance -= amount;
    await user.save();

    const html = withdrawalRequestTemplate(user.userName, amount);

    await sendEmail(user.email, "Withdrawal Request Submitted", html
    );

    const AdminHtml = adminWithdrawalRequestTemplate(
      user.userName,
      user.email,
      amount,
      payment.methodType,
      payment.accountNumber
    );

    const adminMails = "admin@egrif.online" || "fakherbaho@gmail.com"

    await sendEmail(adminMails,
      "New Withdrawal Request 🚨",
      AdminHtml
    );

    return responseHandler(
      res,
      200,
      {
        withdrawal,
        balance: user.balance,
      },
      "Withdrawal request submitted successfully"
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


export const getUserWithdrawals = async (req, res) => {
  try {
    const userId = req.user?.id;

    const withdrawals = await withdrawalModel
      .find({ user: userId })
      .sort({ createdAt: -1 });

    if (!withdrawals.length) {
      return responseHandler(
        res,
        404,
        [],
        "No withdrawal history found",
        false
      );
    }

    return responseHandler(
      res,
      200,
      { withdrawals },
      "Withdrawal history fetched successfully"
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

// export const pokiCoinIncrease = async (req, res) => {
//   try {
//     const userId = req.user?.id;

//     const user = await userModel.findOneAndUpdate(
//       { _id: userId, poki: { $lt: 500 } },
//       { $inc: { poki: 1 } },
//       { returnDocument: "after" }
//     ).select("poki");

//     if (!user) {
//       return responseHandler(res, 400, {}, "Limit reached (max 500)", false);
//     }

//     return responseHandler(res, 200, user, "Poki increased");
//   } catch (error) {
//     return responseHandler(res, 500, {}, error.message, false);
//   }
// };


// export const tenPokiCoinIncrease = async (req, res) => {
//   try {
//     const userId = req.user?.id;

//     const user = await userModel.findOneAndUpdate(
//       { _id: userId, poki: { $lt: 500 } }, // 👈 sirf tab update jab < 500 ho
//       { $inc: { poki: 10 } },
//       { returnDocument: "after" }
//     ).select("poki");

//     if (!user) {
//       return responseHandler(res, 400, {}, "Limit reached (max 500)", false);
//     }

//     return responseHandler(res, 200, user, "ten Poki increased ");
//   } catch (error) {
//     return responseHandler(res, 500, {}, error.message, false);
//   }
// };



