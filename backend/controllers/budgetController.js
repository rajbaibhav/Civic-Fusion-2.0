import Budget from '../models/Budget.js';
import Project from '../models/Project.js';

export const getBudgetByProject = async (req, res) => {
  try {
    const budget = await Budget.findOne({ project: req.params.projectId })
      .populate('project', 'title description')
      .populate('history.updatedBy', 'name email role');

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found for this project' });
    }

    res.json(budget);
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getBudgetHistory = async (req, res) => {
  try {
    const budget = await Budget.findOne({ project: req.params.projectId })
      .populate('history.updatedBy', 'name email role')
      .select('history');

    if (!budget) {
      return res.status(404).json({ error: 'Budget not found for this project' });
    }

    res.json({ history: budget.history });
  } catch (error) {
    console.error('Get budget history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const addBudget = async (req, res) => {
  try {
    const { allocatedAmount } = req.body;

    if (!allocatedAmount || allocatedAmount < 0) {
      return res.status(400).json({ error: 'Valid allocated amount is required' });
    }

    // Check if project exists
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if budget already exists
    const existingBudget = await Budget.findOne({ project: req.params.projectId });
    if (existingBudget) {
      return res.status(400).json({ error: 'Budget already exists for this project' });
    }

    const budget = await Budget.create({
      project: req.params.projectId,
      allocatedAmount,
      spentAmount: 0
    });

    // Add initial entry to history
    budget.history.push({
      allocatedAmount,
      spentAmount: 0,
      updatedBy: req.user._id,
      notes: 'Initial budget allocation'
    });
    await budget.save();

    const populatedBudget = await Budget.findById(budget._id)
      .populate('project', 'title description')
      .populate('history.updatedBy', 'name email role');

    res.status(201).json({ message: 'Budget added successfully', budget: populatedBudget });
  } catch (error) {
    console.error('Add budget error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateBudget = async (req, res) => {
  try {
    const { allocatedAmount, spentAmount, notes } = req.body;

    const budget = await Budget.findOne({ project: req.params.projectId });
    if (!budget) {
      return res.status(404).json({ error: 'Budget not found for this project' });
    }

    const updates = {};
    if (allocatedAmount !== undefined) {
      if (allocatedAmount < 0) {
        return res.status(400).json({ error: 'Allocated amount cannot be negative' });
      }
      updates.allocatedAmount = allocatedAmount;
    }

    if (spentAmount !== undefined) {
      if (spentAmount < 0) {
        return res.status(400).json({ error: 'Spent amount cannot be negative' });
      }
      if (spentAmount > budget.allocatedAmount) {
        return res.status(400).json({ error: 'Spent amount cannot exceed allocated amount' });
      }
      updates.spentAmount = spentAmount;
    }

    // Add to history
    budget.history.push({
      allocatedAmount: updates.allocatedAmount || budget.allocatedAmount,
      spentAmount: updates.spentAmount !== undefined ? updates.spentAmount : budget.spentAmount,
      updatedBy: req.user._id,
      notes: notes || ''
    });

    Object.assign(budget, updates);
    await budget.save();

    const populatedBudget = await Budget.findById(budget._id)
      .populate('project', 'title description')
      .populate('history.updatedBy', 'name email role');

    res.json({ message: 'Budget updated successfully', budget: populatedBudget });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
