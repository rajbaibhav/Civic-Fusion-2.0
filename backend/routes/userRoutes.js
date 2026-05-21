import express from 'express';
import { getProfile, updateProfile, deactivateAccount } from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/deactivate', deactivateAccount);

export default router;
