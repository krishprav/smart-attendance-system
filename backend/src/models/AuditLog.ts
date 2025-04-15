import mongoose from 'mongoose';

export interface IAuditLog extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
}

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

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);