import Project from '../models/Project.js';
import Budget from '../models/Budget.js';

export const getAllProjects = async (req, res) => {
  try {
    const { department, status, location } = req.query;
    const filter = { isArchived: false };

    if (department) filter.department = department;
    if (status) filter.status = status;
    if (location) filter.location = location;

    const projects = await Project.find(filter)
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error('Get all projects error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('progressHistory.updatedBy', 'name email');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, description, department, location } = req.body;

    const project = await Project.create({
      title,
      description,
      department,
      location,
      createdBy: req.user._id
    });

    const populatedProject = await Project.findById(project._id)
      .populate('createdBy', 'name email role');

    res.status(201).json({ message: 'Project created successfully', project: populatedProject });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { title, description, department, location } = req.body;
    const updates = {};

    if (title) updates.title = title;
    if (description) updates.description = description;
    if (department) updates.department = department;
    if (location) updates.location = location;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project updated successfully', project });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['planned', 'ongoing', 'completed', 'stalled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email role');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project status updated successfully', project });
  } catch (error) {
    console.error('Update project status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const archiveProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { isArchived: true },
      { new: true }
    ).populate('createdBy', 'name email role');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project archived successfully', project });
  } catch (error) {
    console.error('Archive project error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
