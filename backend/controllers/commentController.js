import Comment from '../models/Comment.js';
import Project from '../models/Project.js';

export const getCommentsByProject = async (req, res) => {
  try {
    const comments = await Comment.find({
      project: req.params.projectId,
      isDeleted: false
    })
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    // Check if project exists
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const comment = await Comment.create({
      project: req.params.projectId,
      user: req.user._id,
      content: content.trim()
    });

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email role')
      .populate('project', 'title');

    res.status(201).json({ message: 'Comment added successfully', comment: populatedComment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.isDeleted) {
      return res.status(400).json({ error: 'Comment has been deleted' });
    }

    // Check if user owns the comment
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    comment.content = content.trim();
    await comment.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate('user', 'name email role')
      .populate('project', 'title');

    res.json({ message: 'Comment updated successfully', comment: populatedComment });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (comment.isDeleted) {
      return res.status(400).json({ error: 'Comment already deleted' });
    }

    // Check if user owns the comment or is admin
    if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    comment.isDeleted = true;
    comment.deletedBy = req.user._id;
    await comment.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
