import mongoose from 'mongoose';

export interface IEngagement extends mongoose.Document {
  session: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  metrics: {
    timestamp: Date;
    attention: number;
    engagement: number;
    emotion: string;
    image?: string;
  }[];
  averageAttention: number;
  averageEngagement: number;
  dominantEmotion: string;
  emotionCounts: {
    [key: string]: number;
  };
}

const EngagementSchema = new mongoose.Schema({
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
  metrics: [
    {
      timestamp: {
        type: Date,
        default: Date.now,
      },
      attention: {
        type: Number,
        min: 0,
        max: 1,
        required: [true, 'Please add an attention score'],
      },
      engagement: {
        type: Number,
        min: 0,
        max: 1,
        required: [true, 'Please add an engagement score'],
      },
      emotion: {
        type: String,
        enum: ['neutral', 'happy', 'sad', 'angry', 'surprised', 'confused', 'bored', 'engaged'],
        default: 'neutral',
      },
      image: {
        type: String,
      },
    },
  ],
  averageAttention: {
    type: Number,
    min: 0,
    max: 1,
    default: 0,
  },
  averageEngagement: {
    type: Number,
    min: 0,
    max: 1,
    default: 0,
  },
  dominantEmotion: {
    type: String,
    enum: ['neutral', 'happy', 'sad', 'angry', 'surprised', 'confused', 'bored', 'engaged'],
    default: 'neutral',
  },
  emotionCounts: {
    type: Map,
    of: Number,
    default: {
      neutral: 0,
      happy: 0,
      sad: 0,
      angry: 0,
      surprised: 0,
      confused: 0,
      bored: 0,
      engaged: 0,
    },
  },
}, {
  timestamps: true,
});

// Enforce unique student per session
EngagementSchema.index({ session: 1, student: 1 }, { unique: true });

// Pre-save hook to calculate average metrics and dominant emotion
EngagementSchema.pre<IEngagement>('save', function(next) {
  if (this.metrics.length === 0) {
    return next();
  }
  
  // Calculate average attention and engagement
  this.averageAttention = this.metrics.reduce((sum, metric) => sum + metric.attention, 0) / this.metrics.length;
  this.averageEngagement = this.metrics.reduce((sum, metric) => sum + metric.engagement, 0) / this.metrics.length;
  
  // Count emotions
  const emotionCounts: { [key: string]: number } = {
    neutral: 0,
    happy: 0,
    sad: 0,
    angry: 0,
    surprised: 0,
    confused: 0,
    bored: 0,
    engaged: 0,
  };
  
  this.metrics.forEach(metric => {
    emotionCounts[metric.emotion] = (emotionCounts[metric.emotion] || 0) + 1;
  });
  
  this.emotionCounts = emotionCounts;
  
  // Find dominant emotion
  let maxCount = 0;
  let dominantEmotion = 'neutral';
  
  for (const [emotion, count] of Object.entries(emotionCounts)) {
    if (count > maxCount) {
      maxCount = count;
      dominantEmotion = emotion;
    }
  }
  
  this.dominantEmotion = dominantEmotion;
  
  return next();
});

export default mongoose.model<IEngagement>('Engagement', EngagementSchema);