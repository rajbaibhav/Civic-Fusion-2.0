import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const progressHistorySchema = new mongoose.Schema({
  progress: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  notes: {
    type: String,
    trim: true
  },
  images: [{
    imageUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['planned', 'ongoing', 'completed', 'stalled'],
    default: 'planned'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  progressHistory: [progressHistorySchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for filtering
projectSchema.index({ status: 1, department: 1, location: 1 });

const Project = mongoose.model('Project', projectSchema);
export default Project;
