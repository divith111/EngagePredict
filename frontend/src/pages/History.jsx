import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import {
    History as HistoryIcon,
    TrendingUp,
    TrendingDown,
    Trash2,
    RefreshCw,
    Calendar,
    Filter,
    ChevronDown,
    BarChart3,
    Image,
    Video,
    ExternalLink
} from 'lucide-react';

export default function History() {
    const { user } = useAuth();
    const [predictions, setPredictions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [sortBy, setSortBy] = useState('newest');

    useEffect(() => {
        if (user) {
            fetchPredictions();
        }
    }, [user]);

    const fetchPredictions = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'predictions'),
                where('userId', '==', user.uid),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate?.() || new Date()
            }));

            setPredictions(data);
        } catch (error) {
            console.error('Error fetching predictions:', error);
        } finally {
            setLoading(false);
        }
    };

    const deletePrediction = async (id) => {
        if (!confirm('Delete this prediction from history?')) return;

        try {
            await deleteDoc(doc(db, 'predictions', id));
            setPredictions(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting prediction:', error);
        }
    };

    const filteredPredictions = predictions
        .filter(p => {
            if (filter === 'all') return true;
            if (filter === 'high') return p.score >= 80;
            if (filter === 'medium') return p.score >= 60 && p.score < 80;
            if (filter === 'low') return p.score < 60;
            if (filter === p.platform) return true;
            return false;
        })
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
            if (sortBy === 'highest') return b.score - a.score;
            if (sortBy === 'lowest') return a.score - b.score;
            return 0;
        });

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-500 bg-green-50';
        if (score >= 60) return 'text-yellow-500 bg-yellow-50';
        return 'text-red-500 bg-red-50';
    };

    const getPlatformIcon = (platform) => {
        switch (platform) {
            case 'instagram': return '📸';
            case 'tiktok': return '🎵';
            case 'youtube': return '▶️';
            case 'twitter': return '𝕏';
            case 'facebook': return '📘';
            default: return '📱';
        }
    };

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Calculate stats
    const stats = {
        total: predictions.length,
        avgScore: predictions.length > 0
            ? Math.round(predictions.reduce((acc, p) => acc + p.score, 0) / predictions.length)
            : 0,
        highPerforming: predictions.filter(p => p.score >= 80).length,
        improvement: predictions.length >= 2
            ? predictions[0].score - predictions[predictions.length - 1].score
            : 0
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-luxury-light flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-luxury-light py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-luxury-black mb-2">
                            Prediction History
                        </h1>
                        <p className="text-gray-600">
                            Track your content improvement over time
                        </p>
                    </div>
                    <button
                        onClick={fetchPredictions}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-luxury-gray rounded-full hover:border-gold-500 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="glass-card p-5 text-center">
                        <BarChart3 className="w-6 h-6 mx-auto mb-2 text-gold-500" />
                        <p className="text-2xl font-bold text-luxury-dark">{stats.total}</p>
                        <p className="text-sm text-gray-500">Total Analyses</p>
                    </div>
                    <div className="glass-card p-5 text-center">
                        <div className="w-6 h-6 mx-auto mb-2 text-2xl">📊</div>
                        <p className="text-2xl font-bold gold-text">{stats.avgScore}</p>
                        <p className="text-sm text-gray-500">Avg. Score</p>
                    </div>
                    <div className="glass-card p-5 text-center">
                        <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                        <p className="text-2xl font-bold text-green-600">{stats.highPerforming}</p>
                        <p className="text-sm text-gray-500">High Performers</p>
                    </div>
                    <div className="glass-card p-5 text-center">
                        {stats.improvement >= 0 ? (
                            <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-500" />
                        ) : (
                            <TrendingDown className="w-6 h-6 mx-auto mb-2 text-red-500" />
                        )}
                        <p className={`text-2xl font-bold ${stats.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {stats.improvement >= 0 ? '+' : ''}{stats.improvement}
                        </p>
                        <p className="text-sm text-gray-500">Score Trend</p>
                    </div>
                </div>

                {predictions.length === 0 ? (
                    <div className="glass-card p-12 text-center">
                        <HistoryIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h2 className="text-xl font-semibold text-luxury-dark mb-2">
                            No predictions yet
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Start analyzing your content to build your history
                        </p>
                        <Link to="/analyze" className="gold-button inline-flex items-center gap-2">
                            Analyze Now
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">Filter:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['all', 'high', 'medium', 'low'].map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-3 py-1.5 text-sm rounded-full transition-colors ${filter === f
                                                ? 'bg-gold-500 text-white'
                                                : 'bg-white border border-luxury-gray hover:border-gold-500'
                                            }`}
                                    >
                                        {f === 'all' ? 'All' :
                                            f === 'high' ? '🟢 High' :
                                                f === 'medium' ? '🟡 Medium' : '🔴 Low'}
                                    </button>
                                ))}
                            </div>
                            <div className="ml-auto">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="text-sm border border-luxury-gray rounded-lg px-3 py-1.5 bg-white"
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="oldest">Oldest First</option>
                                    <option value="highest">Highest Score</option>
                                    <option value="lowest">Lowest Score</option>
                                </select>
                            </div>
                        </div>

                        {/* Predictions List */}
                        <div className="space-y-4">
                            {filteredPredictions.map((prediction) => (
                                <div
                                    key={prediction.id}
                                    className="glass-card p-5 hover:shadow-luxury-lg transition-shadow"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        {/* Score */}
                                        <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${getScoreColor(prediction.score)}`}>
                                            <span className="text-2xl font-bold">{prediction.score}</span>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xl">{getPlatformIcon(prediction.platform)}</span>
                                                <span className="font-semibold text-luxury-dark capitalize">
                                                    {prediction.platform}
                                                </span>
                                                <span className="text-gray-300">•</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getScoreColor(prediction.score)}`}>
                                                    {prediction.engagementLevel}
                                                </span>
                                            </div>

                                            {prediction.caption && (
                                                <p className="text-sm text-gray-600 truncate mb-2">
                                                    {prediction.caption.substring(0, 100)}
                                                    {prediction.caption.length > 100 ? '...' : ''}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    {prediction.mediaType === 'video' ? (
                                                        <Video className="w-3 h-3" />
                                                    ) : (
                                                        <Image className="w-3 h-3" />
                                                    )}
                                                    {prediction.mediaType}
                                                </span>
                                                {prediction.resolution && (
                                                    <span>{prediction.resolution}</span>
                                                )}
                                                {prediction.orientation && (
                                                    <span>{prediction.orientation}</span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {formatDate(prediction.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => deletePrediction(prediction.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredPredictions.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                No predictions match your filter
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
