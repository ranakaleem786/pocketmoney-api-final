import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/logout", auth, userController.logout);
router.post("/forgot-password", userController.forgotPassword);
router.post("/reset-password/:token", userController.resetPassword);
router.post("/update", auth, userController.userUpdate);
router.get("/find-me", auth, userController.findMe);
// router.get("/pokicoinincrease", auth, userController.pokiCoinIncrease);
// router.get("/tenpokicoinincrease", auth, userController.tenPokiCoinIncrease);

// PaymentMethod
router.post("/payment-method-add-edit", auth, userController.pymentMethodAddEdit);
router.get("/get-payment-method", auth, userController.getPaymentMethod);


// withdrawal
router.post("/withdrawal", auth, userController.withdrawalReq);
router.get("/get-withdrawals", auth, userController.getUserWithdrawals);

export default router;