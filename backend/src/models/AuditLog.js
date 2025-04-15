const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a user'],
  },
  action: {
    type: String,
    required: [true, 'Please add an action'],
    enum: ['create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'other'],
  },
  resource: {
    type: String,
    required: [true, 'Please add a resource'],
  },
  resourceId: {
    type: String,
  },
  details: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);