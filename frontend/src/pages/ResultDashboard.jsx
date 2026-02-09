import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
    TrendingUp,
    TrendingDown,
    Check,
    X,
    AlertTriangle,
    Sparkles,
    ArrowRight,
    RefreshCw,
    Download,
    Share2,
    Clock,
    Hash,
    Monitor,
    Smartphone,
    Zap,
    Target,
    Lightbulb
} from 'lucide-react';

export default function ResultDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [analysisData, setAnalysisData] = useState(null);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const pendingData = sessionStorage.getItem('pendingAnalysis');
        if (!pendingData) {
            navigate('/analyze');
            return;
        }

        const data = JSON.parse(pendingData);
        setAnalysisData(data);

        // Simulate ML prediction (replace with actual API call)
        setTimeout(() => {
            const prediction = generatePrediction(data);
            setResults(prediction);
            setLoading(false);

            // Auto-save to history
            savePrediction(data, prediction);
        }, 2000);
    }, [navigate]);

    const generatePrediction = (data) => {
        let score = 50; // Base score
        const feedback = [];
        const tips = [];

        // Media quality checks
        if (data.mediaInfo) {
            const { orientation, resolution, qualityScore } = data.mediaInfo;

            // Resolution check
            if (resolution === '4K' || resolution === '1080p') {
                score += 15;
                feedback.push({ type: 'success', text: 'High-quality resolution detected', impact: '+15%' });
            } else if (resolution === '720p') {
                score += 5;
                feedback.push({ type: 'warning', text: 'Consider upgrading to 1080p for better engagement', impact: '+5%' });
            } else {
                score -= 10;
                feedback.push({ type: 'error', text: 'Low resolution may reduce engagement', impact: '-10%' });
            }

            // Orientation check based on platform
            const verticalPlatforms = ['tiktok', 'instagram'];
            if (verticalPlatforms.includes(data.platform)) {
                if (orientation === 'Portrait') {
                    score += 20;
                    feedback.push({ type: 'success', text: `Portrait orientation is optimal for ${data.platform}`, impact: '+20%' });
                } else {
                    score -= 15;
                    feedback.push({ type: 'error', text: `Change to Portrait orientation for 40% higher reach on ${data.platform}`, impact: '-15%' });
                }
            } else if (data.platform === 'youtube') {
                if (orientation === 'Landscape') {
                    score += 15;
                    feedback.push({ type: 'success', text: 'Landscape orientation is ideal for YouTube', impact: '+15%' });
                } else {
                    score -= 10;
                    feedback.push({ type: 'warning', text: 'Consider Landscape orientation for YouTube', impact: '-10%' });
                }
            }
        }

        // Caption analysis
        const captionLength = data.caption?.length || 0;
        if (captionLength > 100 && captionLength < 300) {
            score += 10;
            feedback.push({ type: 'success', text: 'Optimal caption length', impact: '+10%' });
        } else if (captionLength < 50) {
            score -= 5;
            feedback.push({ type: 'warning', text: 'Add more context to your caption', impact: '-5%' });
        } else if (captionLength > 500) {
            score -= 5;
            feedback.push({ type: 'warning', text: 'Consider shortening your caption', impact: '-5%' });
        }

        // Hashtag analysis
        const hashtagCount = (data.hashtags?.match(/#\w+/g) || []).length;
        if (hashtagCount >= 3 && hashtagCount <= 10) {
            score += 10;
            feedback.push({ type: 'success', text: `${hashtagCount} hashtags is within optimal range`, impact: '+10%' });
        } else if (hashtagCount < 3) {
            score -= 5;
            feedback.push({ type: 'warning', text: `Add ${3 - hashtagCount} more hashtags for better discoverability`, impact: '-5%' });
        } else if (hashtagCount > 15) {
            score -= 10;
            feedback.push({ type: 'error', text: 'Too many hashtags may look spammy', impact: '-10%' });
        }

        // Posting time analysis
        if (data.postingTime) {
            const hour = parseInt(data.postingTime.split(':')[0]);
            if ((hour >= 9 && hour <= 11) || (hour >= 18 && hour <= 21)) {
                score += 10;
                feedback.push({ type: 'success', text: 'Great posting time for maximum engagement', impact: '+10%' });
            } else if (hour >= 0 && hour <= 6) {
                score -= 10;
                feedback.push({ type: 'error', text: 'Consider posting during peak hours (9-11 AM or 6-9 PM)', impact: '-10%' });
            }
        }

        // Day of week
        const bestDays = ['Tuesday', 'Wednesday', 'Thursday'];
        if (bestDays.includes(data.dayOfWeek)) {
            score += 5;
            feedback.push({ type: 'success', text: `${data.dayOfWeek} is a high-engagement day`, impact: '+5%' });
        }

        // Clamp score
        score = Math.max(0, Math.min(100, score));

        // Generate tips based on score
        if (score >= 80) {
            tips.push('Your content is optimized for viral potential!');
            tips.push('Consider A/B testing different captions');
            tips.push('Engage with comments in the first hour for algorithm boost');
        } else if (score >= 60) {
            tips.push('Post consistently to build momentum');
            tips.push('Use trending audio for additional reach');
            tips.push('Cross-promote on other platforms');
        } else {
            tips.push('Focus on improving content quality first');
            tips.push('Study top performers in your niche');
            tips.push('Consider collaborating with other creators');
        }

        const engagementLevel = score >= 80 ? 'High' : score >= 60 ? 'Medium' : 'Low';

        return {
            score,
            engagementLevel,
            feedback,
            tips,
            predictedReach: Math.round(score * 100 + Math.random() * 500),
            predictedLikes: Math.round(score * 10 + Math.random() * 50),
            predictedComments: Math.round(score * 2 + Math.random() * 10)
        };
    };

    const savePrediction = async (data, prediction) => {
        if (!user) return;

        setSaving(true);
        try {
            await addDoc(collection(db, 'predictions'), {
                userId: user.uid,
                platform: data.platform,
                caption: data.caption,
                hashtags: data.hashtags,
                mediaType: data.mediaInfo?.type,
                resolution: data.mediaInfo?.resolution,
                orientation: data.mediaInfo?.orientation,
                score: prediction.score,
                engagementLevel: prediction.engagementLevel,
                feedback: prediction.feedback,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error('Error saving prediction:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-luxury-light flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                        <div className="absolute inset-0 border-4 border-gold-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-gold-500 rounded-full border-t-transparent animate-spin"></div>
                        <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-gold-500" />
                    </div>
                    <h2 className="text-xl font-semibold text-luxury-dark mb-2">
                        Analyzing Your Content
                    </h2>
                    <p className="text-gray-500">
                        Our AI is predicting engagement potential...
                    </p>
                </div>
            </div>
        );
    }

    if (!results) {
        return null;
    }

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        return 'text-red-500';
    };

    const getScoreGradient = (score) => {
        if (score >= 80) return 'from-green-400 to-green-600';
        if (score >= 60) return 'from-yellow-400 to-yellow-600';
        return 'from-red-400 to-red-600';
    };

    return (
        <div className="min-h-screen bg-luxury-light py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-luxury-black mb-3">
                        Engagement Prediction
                    </h1>
                    <p className="text-gray-600">
                        AI-powered analysis of your content's viral potential
                    </p>
                </div>

                {/* Main Score Card */}
                <div className="glass-card p-8 md:p-12 mb-8">
                    <div className="flex flex-col lg:flex-row items-center gap-10">
                        {/* Score Gauge */}
                        <div className="relative">
                            <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                                {/* Background circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="#E5E7EB"
                                    strokeWidth="8"
                                />
                                {/* Progress circle */}
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="45"
                                    fill="none"
                                    stroke="url(#scoreGradient)"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeDasharray="283"
                                    strokeDashoffset={283 - (283 * results.score / 100)}
                                    className="transition-all duration-1000 ease-out"
                                />
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#D4AF37" />
                                        <stop offset="100%" stopColor="#B8962E" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-bold gold-text">{results.score}</span>
                                <span className="text-sm text-gray-500 mt-1">out of 100</span>
                            </div>
                        </div>

                        {/* Score Details */}
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-50 mb-4">
                                {results.score >= 70 ? (
                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                ) : (
                                    <TrendingDown className="w-5 h-5 text-yellow-500" />
                                )}
                                <span className={`font-semibold ${getScoreColor(results.score)}`}>
                                    {results.engagementLevel} Engagement Potential
                                </span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-luxury-black mb-4">
                                {results.score >= 80 ? 'Excellent Work! 🚀' :
                                    results.score >= 60 ? 'Good Start! 💪' :
                                        'Room for Improvement 📈'}
                            </h2>
                            <p className="text-gray-600 mb-6 max-w-lg">
                                {results.score >= 80
                                    ? 'Your content is well-optimized for maximum engagement. Follow our tips to push it even further!'
                                    : results.score >= 60
                                        ? 'You\'re on the right track. Apply our recommendations to boost your engagement potential.'
                                        : 'Don\'t worry! Apply our suggestions below to significantly improve your content\'s performance.'}
                            </p>

                            {/* Predicted Stats */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-luxury-light rounded-xl p-4 text-center">
                                    <Target className="w-5 h-5 mx-auto mb-2 text-gold-500" />
                                    <p className="text-2xl font-bold text-luxury-dark">{results.predictedReach.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500">Est. Reach</p>
                                </div>
                                <div className="bg-luxury-light rounded-xl p-4 text-center">
                                    <Zap className="w-5 h-5 mx-auto mb-2 text-gold-500" />
                                    <p className="text-2xl font-bold text-luxury-dark">{results.predictedLikes}</p>
                                    <p className="text-xs text-gray-500">Est. Likes</p>
                                </div>
                                <div className="bg-luxury-light rounded-xl p-4 text-center">
                                    <span className="text-xl mb-2 block">💬</span>
                                    <p className="text-2xl font-bold text-luxury-dark">{results.predictedComments}</p>
                                    <p className="text-xs text-gray-500">Est. Comments</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback & Tips Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Actionable Feedback */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                                <Check className="w-5 h-5 text-gold-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-luxury-black">Analysis Feedback</h3>
                                <p className="text-sm text-gray-500">What's working and what to improve</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {results.feedback.map((item, index) => (
                                <div
                                    key={index}
                                    className={`flex items-start gap-3 p-4 rounded-xl ${item.type === 'success' ? 'bg-green-50' :
                                            item.type === 'warning' ? 'bg-yellow-50' : 'bg-red-50'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${item.type === 'success' ? 'bg-green-500' :
                                            item.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`}>
                                        {item.type === 'success' ? (
                                            <Check className="w-4 h-4 text-white" />
                                        ) : item.type === 'warning' ? (
                                            <AlertTriangle className="w-4 h-4 text-white" />
                                        ) : (
                                            <X className="w-4 h-4 text-white" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${item.type === 'success' ? 'text-green-800' :
                                                item.type === 'warning' ? 'text-yellow-800' : 'text-red-800'
                                            }`}>
                                            {item.text}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-semibold ${item.impact.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {item.impact}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pro Tips */}
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                                <Lightbulb className="w-5 h-5 text-gold-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-luxury-black">
                                    {results.score >= 80 ? 'Booming Tips 🔥' : 'Pro Tips'}
                                </h3>
                                <p className="text-sm text-gray-500">Expert recommendations for maximum reach</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {results.tips.map((tip, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 p-4 bg-gold-50 rounded-xl"
                                >
                                    <Sparkles className="w-5 h-5 text-gold-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-gold-800">{tip}</p>
                                </div>
                            ))}

                            {/* Platform-specific tip */}
                            {analysisData?.platform && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-gold-100 to-gold-50 rounded-xl border border-gold-200">
                                    <p className="text-sm font-medium text-gold-800 mb-1">
                                        💡 Best time to post on {analysisData.platform}:
                                    </p>
                                    <p className="text-sm text-gold-700">
                                        {analysisData.platform === 'instagram' ? '6:00 PM - 9:00 PM EST, Tuesday-Thursday' :
                                            analysisData.platform === 'tiktok' ? '7:00 PM - 11:00 PM EST, Any day' :
                                                analysisData.platform === 'youtube' ? '2:00 PM - 4:00 PM EST, Friday-Sunday' :
                                                    analysisData.platform === 'twitter' ? '8:00 AM - 10:00 AM EST, Weekdays' :
                                                        '6:00 PM - 9:00 PM, Weekdays'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/analyze"
                        className="flex items-center gap-2 px-6 py-3 bg-luxury-dark text-white rounded-full font-medium hover:bg-luxury-black transition-colors"
                    >
                        <RefreshCw className="w-5 h-5" />
                        Analyze Another Post
                    </Link>
                    <Link
                        to="/history"
                        className="flex items-center gap-2 px-6 py-3 border-2 border-luxury-gray text-luxury-dark rounded-full font-medium hover:border-gold-500 hover:text-gold-600 transition-colors"
                    >
                        View History
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>

                {/* Saving indicator */}
                {saving && (
                    <p className="text-center text-sm text-gray-500 mt-4">
                        Saving to history...
                    </p>
                )}
            </div>
        </div>
    );
}
