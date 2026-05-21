import express from 'express';
import {
  getCommentsByProject,
  addComment,
  updateComment,
  deleteComment
} from '../controllers/commentController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/project/:projectId', getCommentsByProject);

// Protected routes - require authentication
router.use(authenticate);

// Citizen and volunteer can add comments
router.post('/project/:projectId', authorize('citizen', 'volunteer', 'official', 'admin'), addComment);
router.put('/:id', updateComment); // Users can edit their own comments
router.delete('/:id', deleteComment); // Users can delete their own comments, admin can delete any

export default router;
