import mongoose from 'mongoose';

export interface ICompliance extends mongoose.Document {
  session: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  idCardVisible: boolean;
  phoneDetections: {
    timestamp: Date;
    confidence: number;
    image?: string;
  }[];
  overallCompliance: number;
}

const ComplianceSchema = new mongoose.Schema({
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
  idCardVisible: {
    type: Boolean,
    default: false,
  },
  phoneDetections: [
    {
      timestamp: {
        type: Date,
        default: Date.now,
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        required: [true, 'Please add a confidence score'],
      },
      image: {
        type: String,
      },
    },
  ],
  overallCompliance: {
    type: Number,
    min: 0,
    max: 1,
    default: 1, // Start with perfect compliance
  },
}, {
  timestamps: true,
});

// Enforce unique student per session
ComplianceSchema.index({ session: 1, student: 1 }, { unique: true });

// Pre-save hook to calculate overall compliance
ComplianceSchema.pre<ICompliance>('save', function(next) {
  // Start with 1.0 (100% compliance)
  let compliance = 1.0;
  
  // Deduct points for no ID card
  if (!this.idCardVisible) {
    compliance -= 0.3; // Deduct 30% for no ID card
  }
  
  // Deduct points for phone detections
  if (this.phoneDetections.length > 0) {
    // More detections = more penalty, but cap at 0.7 (phone is a serious violation)
    const phoneDeduction = Math.min(0.7, this.phoneDetections.length * 0.15);
    compliance -= phoneDeduction;
  }
  
  // Ensure compliance is between 0 and 1
  this.overallCompliance = Math.max(0, Math.min(1, compliance));
  
  return next();
});

export default mongoose.model<ICompliance>('Compliance', ComplianceSchema);