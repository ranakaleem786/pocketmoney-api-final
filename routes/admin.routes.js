import express from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();


// admin routes
router.get('/get-all-users', auth, adminController.getAllUser);
// router.get('/search-users', auth, adminController.getAllUser);
router.put('/update-user/:id', auth, adminController.updateUser);
router.delete('/delete-user/:id', auth, adminController.deleteUser);

// bounty
router.post("/create-bounty", auth, adminController.createBounty);
router.get("/getalluserbountesonly", auth, adminController.getAllUserBountesOnly);
router.get("/get-all-admin-bounties-only", auth, adminController.getAllAdminBountesOnly);
router.get("/getalladminbountesonly", auth, adminController.getAllAdminBountesOnly);
router.delete("/delete-bounty/:id", auth, adminController.deleteBounty);

// monthly Bounty
router.post("/create-mbounty", auth, adminController.createMBounty);
router.get("/get-all-admin-mbountes-only", auth, adminController.getAllAdminMBountesOnly);
router.delete("/delete-mbounty/:id", auth, adminController.deleteMBounty);


// dailyClaimed
router.get("/get-all-daily-claim-record",auth, adminController.getAllDailyClaimedRecord)
router.delete("/delete-daily-claimed-record/:id", auth, adminController.deleteDailyClaimedRecord)
router.post("/delete-all-daily-claimed-record", auth, adminController.deleteAllDailyClaimedRecord)


// withdrawal 
router.put("/withdrawal-status/:id", auth, adminController.withdrawalApproval);
router.get("/get-all-withdrawals", auth, adminController.getAllWithdrawals);


// convertsheet  donload delete
router.get("/export-daily-claimed-record", adminController.exportCSVToCloudinary);

// router.get("/export-csv-cloudinary", exportCSVToCloudinary);

// router.get("/download-daily-claimed-record/:fileName", adminController.downloadDailyClaimedRecord);

// router.delete("/delete-export-file/:fileName", adminController.deleteExportFile);




export default router;