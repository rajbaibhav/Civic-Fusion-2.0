import express from 'express';
import {
  getAllIssues,
  getIssueById,
  createIssue,
  updateIssueStatus,
  respondToIssue,
  escalateIssue
} from '../controllers/issueController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllIssues);
router.get('/:id', getIssueById);

// Protected routes - require authentication
router.use(authenticate);

// Citizens can create issues
router.post('/project/:projectId', authorize('citizen', 'volunteer', 'official', 'admin'), createIssue);

// Officials and admins can update status and respond
router.put('/:id/status', authorize('official', 'admin'), updateIssueStatus);
router.post('/:id/respond', authorize('official', 'admin'), respondToIssue);

// Anyone can escalate (but typically citizens/volunteers)
router.post('/:id/escalate', escalateIssue);

export default router;
