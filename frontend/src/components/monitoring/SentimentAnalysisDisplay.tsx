'use client';

import React, { useState, useEffect } from 'react';

interface EmotionData {
  emotion: string;
  count: number;
  percentage: number;
  color: string;
}

interface SentimentStats {
  dominantEmotion: string;
  avgEngagement: number;
  avgAttention: number;
  emotionBreakdown: EmotionData[];
  totalAnalyzed: number;
}

interface SentimentAnalysisDisplayProps {
  sessionId: string;
  refreshInterval?: number; // in milliseconds
}

const emotionColors = {
  happy: 'bg-yellow-500',
  sad: 'bg-blue-500',
  angry: 'bg-red-500',
  surprised: 'bg-purple-500',
  confused: 'bg-orange-500',
  neutral: 'bg-gray-500',
  bored: 'bg-gray-400',
  engaged: 'bg-green-500'
};

const SentimentAnalysisDisplay: React.FC<SentimentAnalysisDisplayProps> = ({
  sessionId,
  refreshInterval = 15000 // Default to 15 seconds
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<SentimentStats>({
    dominantEmotion: 'neutral',
    avgEngagement: 0,
    avgAttention: 0,
    emotionBreakdown: [],
    totalAnalyzed: 0
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSentimentData = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // const response = await fetch(`/api/sentiment/session/${sessionId}/stats`);
        // const data = await response.json();
        
        // For demo purposes, generate mock data
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Generate random emotion data
        const emotions = ['happy', 'sad', 'angry', 'surprised', 'confused', 'neutral', 'bored', 'engaged'];
        const totalStudents = Math.floor(Math.random() * 30) + 20; // Between 20-50 students
        
        // Generate random counts for each emotion
        const counts: Record<string, number> = {};
        let remainingStudents = totalStudents;
        
        // Generate random counts ensuring they sum to totalStudents
        emotions.forEach((emotion, index) => {
          if (index === emotions.length - 1) {
            counts[emotion] = remainingStudents;
          } else {
            const max = Math.floor(remainingStudents * 0.7);
            counts[emotion] = Math.floor(Math.random() * (max || 1));
            remainingStudents -= counts[emotion];
          }
        });
        
        // Find dominant emotion
        const dominantEmotion = Object.entries(counts).reduce(
          (max, [emotion, count]) => (count > max.count ? { emotion, count } : max),
          { emotion: '', count: 0 }
        ).emotion;
        
        // Create emotion breakdown data
        const emotionBreakdown: EmotionData[] = emotions.map(emotion => ({
          emotion,
          count: counts[emotion],
          percentage: Math.round((counts[emotion] / totalStudents) * 100),
          color: emotionColors[emotion as keyof typeof emotionColors] || 'bg-gray-500'
        })).sort((a, b) => b.count - a.count);
        
        // Calculate random engagement and attention scores (weighted by positive emotions)
        const positiveWeight = (counts['happy'] + counts['engaged'] + counts['surprised']) / totalStudents;
        const negativeWeight = (counts['sad'] + counts['angry'] + counts['bored']) / totalStudents;
        
        const avgEngagement = Math.min(0.95, Math.max(0.3, 0.6 + (positiveWeight - negativeWeight) * 0.3));
        const avgAttention = Math.min(0.95, Math.max(0.3, 0.7 + (positiveWeight - negativeWeight) * 0.2));
        
        setStats({
          dominantEmotion,
          avgEngagement,
          avgAttention,
          emotionBreakdown,
          totalAnalyzed: totalStudents
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching sentiment data:', err);
        setError('Failed to load sentiment data. Please try again later.');
        setLoading(false);
      }
    };

    fetchSentimentData();
    const interval = setInterval(fetchSentimentData, refreshInterval);
    
    return () => clearInterval(interval);
  }, [sessionId, refreshInterval]);

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'happy':
        return '😊';
      case 'sad':
        return '😢';
      case 'angry':
        return '😠';
      case 'surprised':
        return '😲';
      case 'confused':
        return '😕';
      case 'neutral':
        return '😐';
      case 'bored':
        return '😒';
      case 'engaged':
        return '🤩';
      default:
        return '😐';
    }
  };

  const getEngagementColor = (value: number) => {
    if (value >= 0.7) return 'text-green-500';
    if (value >= 0.4) return 'text-yellow-500';
    return 'text-red-500';
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Real-time Sentiment Analysis</h3>
        {loading && (
          <div className="h-5 w-5 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        )}
      </div>

      {loading && stats.totalAnalyzed === 0 ? (
        <div className="h-48 flex items-center justify-center">
          <div className="h-8 w-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Dominant Emotion</div>
              <div className="flex items-center">
                <span className="text-3xl mr-2">{getEmotionIcon(stats.dominantEmotion)}</span>
                <span className="text-lg font-medium capitalize">{stats.dominantEmotion}</span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Average Engagement</div>
              <div className="flex items-center">
                <span className={`text-2xl font-bold ${getEngagementColor(stats.avgEngagement)} mr-1`}>
                  {Math.round(stats.avgEngagement * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    stats.avgEngagement >= 0.7 ? 'bg-green-500' : 
                    stats.avgEngagement >= 0.4 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}
                  style={{ width: `${stats.avgEngagement * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 mb-1">Average Attention</div>
              <div className="flex items-center">
                <span className={`text-2xl font-bold ${getEngagementColor(stats.avgAttention)} mr-1`}>
                  {Math.round(stats.avgAttention * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className={`h-2 rounded-full ${
                    stats.avgAttention >= 0.7 ? 'bg-green-500' : 
                    stats.avgAttention >= 0.4 ? 'bg-yellow-500' : 
                    'bg-red-500'
                  }`}
                  style={{ width: `${stats.avgAttention * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Emotion Breakdown</h4>
            <div className="space-y-3">
              {stats.emotionBreakdown.slice(0, 5).map((item) => (
                <div key={item.emotion} className="flex items-center">
                  <span className="text-lg mr-2">{getEmotionIcon(item.emotion)}</span>
                  <span className="w-24 text-sm capitalize">{item.emotion}</span>
                  <div className="flex-grow">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${item.color}`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-2 text-sm font-medium w-12 text-right">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-xs text-gray-500 mt-4 text-right">
            Based on {stats.totalAnalyzed} students • Last updated: {new Date().toLocaleTimeString()}
          </div>
        </>
      )}
    </div>
  );
};

export default SentimentAnalysisDisplay;
