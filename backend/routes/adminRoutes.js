import express from 'express';
import {
  getAllUsers,
  getUserById,
  assignRole,
  blockUser,
  unblockUser,
  deactivateUser,
  reactivateUser,
  deleteComment,
  getPlatformStats
} from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin'));

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/role', assignRole);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);
router.put('/users/:id/deactivate', deactivateUser);
router.put('/users/:id/reactivate', reactivateUser);

// Moderation
router.delete('/comments/:id', deleteComment);

// Statistics
router.get('/stats', getPlatformStats);

export default router;
