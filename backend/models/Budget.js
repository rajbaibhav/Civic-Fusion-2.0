import mongoose from 'mongoose';

const budgetHistorySchema = new mongoose.Schema({
  allocatedAmount: {
    type: Number,
    required: true,
    min: 0
  },
  spentAmount: {
    type: Number,
    required: true,
    min: 0
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

const budgetSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    unique: true
  },
  allocatedAmount: {
    type: Number,
    required: [true, 'Allocated amount is required'],
    min: 0
  },
  spentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  history: [budgetHistorySchema]
}, {
  timestamps: true
});

// Note: Index is automatically created by unique: true on project field

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget;
