const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  cid: {
    type: String,
    required: true,
    unique: true
  },
  fileId: {
    type: String,
    required: true,
    unique: true
  },
  size: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  owner: {
    type: String,
    required: true
  },
  isPrivate: {
    type: Boolean,
    default: true
  },
  authorizedUsers: {
    type: [String],
    default: []
  },
  provider: {
    type: String,
    required: true
  },
  transactionHash: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  encryptionKey: {
    type: String,
    default: null
  },
  pinStatus: {
    type: String,
    enum: ['pinned', 'unpinned', 'pending', 'failed'],
    default: 'pending'
  }
});

// Indexes for better query performance
FileSchema.index({ owner: 1 });
FileSchema.index({ provider: 1 });
FileSchema.index({ cid: 1 });
FileSchema.index({ fileId: 1 });

module.exports = mongoose.model('File', FileSchema); 