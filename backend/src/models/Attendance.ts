import mongoose from 'mongoose';

export interface IAttendance extends mongoose.Document {
  session: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  status: string;
  markedBy: string;
  markedAt: Date;
  faceVerified: boolean;
  verificationImage?: string;
  verificationConfidence?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

const AttendanceSchema = new mongoose.Schema({
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: [true, 'Please add a session'],
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a student'],
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present',
    required: [true, 'Please add a status'],
  },
  markedBy: {
    type: String,
    enum: ['system', 'faculty', 'student'],
    default: 'system',
    required: [true, 'Please add who marked the attendance'],
  },
  markedAt: {
    type: Date,
    default: Date.now,
  },
  faceVerified: {
    type: Boolean,
    default: false,
  },
  verificationImage: {
    type: String,
  },
  verificationConfidence: {
    type: Number,
    min: 0,
    max: 1,
  },
  location: {
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
}, {
  timestamps: true,
});

// Enforce unique student per session
AttendanceSchema.index({ session: 1, student: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);