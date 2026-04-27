import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

// Load env file
dotenv.config();

const config = {
  // 🌐 Server
  port: process.env.PORT || 9000,
  nodeEnv: process.env.NODE_ENV || "development",

  // 🗄 Database
  mongoURI: process.env.MONGO_URI,

  // 🔑 Auth
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRES_IN,
  jwtResetSecret: process.env.JWT_RESET_SECRET,


  // 🌍 Client
  frontendUrl: process.env.FRONENT_URL,

  // 📂 Upload
  uploadPath: process.env.UPLOAD_PATH || "uploads",
  maxFileSize: process.env.MAX_FILE_SIZE || 5000000,

  // 📧 Email
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    fromMail: process.env.FROM_EMAIL,
  },

  // ☁️ Cloudinary
  cloudinary: {
    // cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    // apiKey: process.env.CLOUDINARY_API_KEY,
    // apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  // 💳 Payments
  // stripe: {
  //   secret: process.env.STRIPE_SECRET_KEY,
  //   webhook: process.env.STRIPE_WEBHOOK_SECRET,
  // },

  // 🔄 Cron
  cronSecret: process.env.CRON_SECRET,

  // 🖥 cPanel
  // cpanel: {
  //   url: process.env.CPANEL_URL,
  //   username: process.env.CPANEL_USERNAME,
  //   token: process.env.CPANEL_API_TOKEN,
  // },

  // 🔐 Security
  // bcryptSalt: parseInt(process.env.BCRYPT_SALT) || 10,
};

export default config;