import mongoose from 'mongoose';

export interface ISession extends mongoose.Document {
  courseId: string;
  faculty: mongoose.Types.ObjectId;
  classType: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  isActive: boolean;
  location?: string;
  attendanceCount: number;
  totalStudents: number;
}

const SessionSchema = new mongoose.Schema({
  courseId: {
    type: String,
    required: [true, 'Please add a course ID'],
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please add a faculty'],
  },
  classType: {
    type: String,
    enum: ['lecture', 'lab', 'tutorial'],
    default: 'lecture',
    required: [true, 'Please add a class type'],
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
  },
  duration: {
    type: Number,
    required: [true, 'Please add a duration in minutes'],
    min: [1, 'Duration must be at least 1 minute'],
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  location: {
    type: String,
  },
  attendanceCount: {
    type: Number,
    default: 0,
  },
  totalStudents: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for attendance percentage
SessionSchema.virtual('attendancePercentage').get(function(this: ISession) {
  if (this.totalStudents === 0) return 0;
  return Math.round((this.attendanceCount / this.totalStudents) * 100);
});

// Cascade delete attendance records when a session is removed
SessionSchema.pre('findOneAndDelete', async function(next) {
  // In mongoose middleware, 'this' is the query object, but TypeScript doesn't know that
  const query = this as any;
  const session = await mongoose.model('Session').findOne(query.getQuery());
  if (session) {
    await mongoose.model('Attendance').deleteMany({ session: session._id });
  }
  return next();
});

export default mongoose.model<ISession>('Session', SessionSchema);