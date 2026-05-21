import express from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  updateProjectStatus,
  archiveProject
} from '../controllers/projectController.js';
import {
  updateProjectProgress,
  updateProjectProgressWithImages
} from '../controllers/projectProgressController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { uploadProgressImages } from '../middleware/upload.middleware.js';

const router = express.Router();

// Public routes
router.get('/', getAllProjects);
router.get('/:id', getProjectById);

// Protected routes - require authentication
router.use(authenticate);

// Official-only routes
router.post('/', authorize('official', 'admin'), createProject);
router.put('/:id', authorize('official', 'admin'), updateProject);
router.put('/:id/status', authorize('official', 'admin'), updateProjectStatus);
// Multipart progress + Cloudinary images (must be registered before /:id/progress)
router.put(
  '/:id/progress/upload',
  authorize('official', 'admin'),
  uploadProgressImages,
  updateProjectProgressWithImages
);
router.put('/:id/progress', authorize('official', 'admin'), updateProjectProgress);
router.put('/:id/archive', authorize('official', 'admin'), archiveProject);

export default router;
