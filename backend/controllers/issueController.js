import Issue from '../models/Issue.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

export const getAllIssues = async (req, res) => {
  try {
    const { project, status, category } = req.query;
    const filter = {};

    if (project) filter.project = project;
    if (status) filter.status = status;
    if (category) filter.category = category;

    const issues = await Issue.find(filter)
      .populate('project', 'title description')
      .populate('raisedBy', 'name email role')
      .populate('responses.respondedBy', 'name email role')
      .populate('escalatedTo', 'name email role')
      .sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    console.error('Get all issues error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('project', 'title description')
      .populate('raisedBy', 'name email role')
      .populate('responses.respondedBy', 'name email role')
      .populate('escalatedTo', 'name email role');

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json(issue);
  } catch (error) {
    console.error('Get issue by ID error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const createIssue = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description, and category are required' });
    }

    // Check if project exists
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const issue = await Issue.create({
      project: req.params.projectId,
      raisedBy: req.user._id,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      priority: priority || 'medium'
    });

    const populatedIssue = await Issue.findById(issue._id)
      .populate('project', 'title description')
      .populate('raisedBy', 'name email role');

    res.status(201).json({ message: 'Issue created successfully', issue: populatedIssue });
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateIssueStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['open', 'in_progress', 'resolved'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('project', 'title description')
      .populate('raisedBy', 'name email role')
      .populate('responses.respondedBy', 'name email role');

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({ message: 'Issue status updated successfully', issue });
  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const respondToIssue = async (req, res) => {
  try {
    const { response } = req.body;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({ error: 'Response content is required' });
    }

    const issue = await Issue.findById(req.params.id);
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    // Add response
    issue.responses.push({
      respondedBy: req.user._id,
      response: response.trim()
    });

    // Update status if it's still open
    if (issue.status === 'open') {
      issue.status = 'in_progress';
    }

    await issue.save();

    const populatedIssue = await Issue.findById(issue._id)
      .populate('project', 'title description')
      .populate('raisedBy', 'name email role')
      .populate('responses.respondedBy', 'name email role');

    res.json({ message: 'Response added successfully', issue: populatedIssue });
  } catch (error) {
    console.error('Respond to issue error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const escalateIssue = async (req, res) => {
  try {
    const { escalatedTo } = req.body;

    if (!escalatedTo) {
      return res.status(400).json({ error: 'Escalation target user ID is required' });
    }

    // Check if target user exists and is an official or admin
    const targetUser = await User.findById(escalatedTo);
    if (!targetUser) {
      return res.status(404).json({ error: 'Target user not found' });
    }

    if (!['official', 'admin'].includes(targetUser.role)) {
      return res.status(400).json({ error: 'Issue can only be escalated to officials or admins' });
    }

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      {
        isEscalated: true,
        escalatedTo,
        status: 'in_progress'
      },
      { new: true, runValidators: true }
    )
      .populate('project', 'title description')
      .populate('raisedBy', 'name email role')
      .populate('responses.respondedBy', 'name email role')
      .populate('escalatedTo', 'name email role');

    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    res.json({ message: 'Issue escalated successfully', issue });
  } catch (error) {
    console.error('Escalate issue error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
