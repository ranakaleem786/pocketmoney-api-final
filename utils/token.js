import config from "../config/config.js";
import jwt from "jsonwebtoken";

export const generateToken = (userId, role, expire = config.jwtExpire) => {
  return jwt.sign(
    { id: userId, role: role },
    config.jwtSecret,
    { expiresIn: expire } // 1 day
  );
};


export const verifyToken = (token) => {
  return jwt.verify(token, config.jwtSecret) 
};


export const resetPasswordToken = (userId) => {
  return jwt.sign(
    { id: userId, type: "reset" },
    config.jwtResetSecret,
    { expiresIn: "10m" }
  );
};

export const verifyResetToken = (token) => {
  const decoded = jwt.verify(token, config.jwtResetSecret);

  if (decoded.type !== "reset") {
    throw new Error("Invalid token");
  }

  return decoded;
};