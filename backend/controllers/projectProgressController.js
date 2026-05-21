import Project from '../models/Project.js';
import { uploadImage, isCloudinaryConfigured } from '../services/cloudinaryService.js';

const parseProgress = (value) => {
  const progress = Number(value);
  if (Number.isNaN(progress) || progress < 0 || progress > 100) {
    return null;
  }
  return progress;
};

const populateProject = (id) =>
  Project.findById(id)
    .populate('createdBy', 'name email role')
    .populate('progressHistory.updatedBy', 'name email role');

export const updateProjectProgress = async (req, res) => {
  try {
    const progress = parseProgress(req.body.progress);
    if (progress === null) {
      return res.status(400).json({ error: 'Progress must be between 0 and 100' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.progressHistory.push({
      progress,
      updatedBy: req.user._id,
      notes: (req.body.notes || '').trim(),
      images: [],
    });
    project.progress = progress;
    await project.save();

    const populatedProject = await populateProject(project._id);
    res.json({ message: 'Project progress updated successfully', project: populatedProject });
  } catch (error) {
    console.error('Update project progress error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProjectProgressWithImages = async (req, res) => {
  try {
    const progress = parseProgress(req.body.progress);
    if (progress === null) {
      return res.status(400).json({ error: 'Progress must be between 0 and 100' });
    }

    const files = req.files || [];
    if (files.length > 0 && !isCloudinaryConfigured()) {
      return res.status(503).json({
        error:
          'Image upload is unavailable. Configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.',
      });
    }

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const images = [];
    for (const file of files) {
      const meta = await uploadImage(file);
      images.push(meta);
    }

    project.progressHistory.push({
      progress,
      updatedBy: req.user._id,
      notes: (req.body.notes || '').trim(),
      images,
    });
    project.progress = progress;
    await project.save();

    const populatedProject = await populateProject(project._id);
    res.json({ message: 'Project progress updated successfully', project: populatedProject });
  } catch (error) {
    console.error('Update project progress with images error:', error);
    res.status(500).json({
      error: error.message || 'Failed to upload progress images',
    });
  }
};
