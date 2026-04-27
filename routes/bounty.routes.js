import express from 'express';
import * as bountyController from '../controllers/bounty.controller.js';
import { auth, claimed } from '../middleware/auth.middleware.js';

const router = express.Router();


// router.post("/create", auth, bountyController.createBounty)
router.get("/get-all", bountyController.getAllBountes)

router.get("/get-all-monthly", bountyController.getAllMonthlyBountes);

router.post("/daily-claimed-record", claimed, bountyController.dailyClaimedRecord);

router.get("/get-claimed-reward-count", auth, bountyController.getClaimedRewardCount);

router.post("/claimed", claimed, bountyController.claimBounty);




export default router;