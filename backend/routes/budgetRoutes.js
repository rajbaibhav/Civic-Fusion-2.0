import express from 'express';
import {
  getBudgetByProject,
  getBudgetHistory,
  addBudget,
  updateBudget
} from '../controllers/budgetController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/project/:projectId', getBudgetByProject);
router.get('/project/:projectId/history', getBudgetHistory);

// Protected routes - require authentication
router.use(authenticate);

// Official-only routes
router.post('/project/:projectId', authorize('official', 'admin'), addBudget);
router.put('/project/:projectId', authorize('official', 'admin'), updateBudget);

export default router;
