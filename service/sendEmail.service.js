// utils/sendEmail.js
import nodemailer from "nodemailer";
import config from "../config/config.js";

export const sendEmail = async (to,subject,htmlData) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.smtp.user,
      pass: config.smtp.pass,
    },
  });

  await transporter.sendMail({
    from: `"PocketMoney Team" ${config.smtp.fromMail}`,
    to,
    subject,
    html: htmlData ,
  });
};