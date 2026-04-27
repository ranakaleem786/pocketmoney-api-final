import argon2 from "argon2";

// Hash password
export const hashPassword = async (password) => {
  return await argon2.hash(password);
};

// Verify password
export const verifyPassword = async (password, hashedPassword) => {
  return await argon2.verify(hashedPassword, password);
};