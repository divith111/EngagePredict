import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Upload,
    Image as ImageIcon,
    Video,
    X,
    Check,
    Clock,
    Hash,
    MapPin,
    Users,
    Calendar,
    Sparkles,
    AlertCircle,
    Monitor,
    Smartphone,
    Instagram,
    Youtube,
    Twitter,
    Facebook,
    Music2
} from 'lucide-react';

export default function Analyze() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        file: null,
        caption: '',
        hashtags: '',
        platform: '',
        postingTime: '',
        dayOfWeek: '',
        location: '',
        targetAudience: ''
    });

    const [mediaInfo, setMediaInfo] = useState(null);
    const [preview, setPreview] = useState(null);
    const [dragOver, setDragOver] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const platforms = [
        { value: 'instagram', label: 'Instagram', icon: Instagram, color: '#E4405F' },
        { value: 'tiktok', label: 'TikTok', icon: Music2, color: '#000000' },
        { value: 'youtube', label: 'YouTube', icon: Youtube, color: '#FF0000' },
        { value: 'twitter', label: 'X (Twitter)', icon: Twitter, color: '#1DA1F2' },
        { value: 'facebook', label: 'Facebook', icon: Facebook, color: '#1877F2' },
    ];

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const audiences = [
        'Gen Z (13-24)',
        'Millennials (25-40)',
        'Gen X (41-56)',
        'Professionals',
        'Students',
        'General'
    ];

    // Analyze media file for resolution, orientation, aspect ratio
    const analyzeMedia = useCallback((file) => {
        return new Promise((resolve) => {
            if (file.type.startsWith('image/')) {
                const img = new window.Image();
                img.onload = () => {
                    const width = img.width;
                    const height = img.height;
                    const orientation = width > height ? 'Landscape' : width < height ? 'Portrait' : 'Square';
                    const aspectRatio = `${width}:${height}`;
                    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
                    const g = gcd(width, height);
                    const simplifiedRatio = `${width / g}:${height / g}`;

                    let resolution = 'SD';
                    if (height >= 2160) resolution = '4K';
                    else if (height >= 1080) resolution = '1080p';
                    else if (height >= 720) resolution = '720p';
                    else if (height >= 480) resolution = '480p';

                    resolve({
                        type: 'image',
                        width,
                        height,
                        orientation,
                        aspectRatio: simplifiedRatio,
                        resolution,
                        qualityScore: height >= 1080 ? 'High' : height >= 720 ? 'Medium' : 'Low'
                    });
                };
                img.src = URL.createObjectURL(file);
            } else if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.onloadedmetadata = () => {
                    const width = video.videoWidth;
                    const height = video.videoHeight;
                    const orientation = width > height ? 'Landscape' : width < height ? 'Portrait' : 'Square';
                    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
                    const g = gcd(width, height);
                    const simplifiedRatio = `${width / g}:${height / g}`;

                    let resolution = 'SD';
                    if (height >= 2160) resolution = '4K';
                    else if (height >= 1080) resolution = '1080p';
                    else if (height >= 720) resolution = '720p';
                    else if (height >= 480) resolution = '480p';

                    resolve({
                        type: 'video',
                        width,
                        height,
                        orientation,
                        aspectRatio: simplifiedRatio,
                        resolution,
                        duration: Math.round(video.duration),
                        qualityScore: height >= 1080 ? 'High' : height >= 720 ? 'Medium' : 'Low'
                    });
                };
                video.src = URL.createObjectURL(file);
            }
        });
    }, []);

    const handleFileDrop = useCallback(async (e) => {
        e.preventDefault();
        setDragOver(false);

        const file = e.dataTransfer?.files[0] || e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            setError('Please upload an image or video file');
            return;
        }

        setError('');
        setFormData(prev => ({ ...prev, file }));
        setPreview(URL.createObjectURL(file));

        const info = await analyzeMedia(file);
        setMediaInfo(info);
    }, [analyzeMedia]);

    const removeFile = () => {
        setFormData(prev => ({ ...prev, file: null }));
        setPreview(null);
        setMediaInfo(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.file) {
            setError('Please upload a media file');
            return;
        }

        if (!formData.platform) {
            setError('Please select a platform');
            return;
        }

        setLoading(true);

        try {
            // Prepare analysis data
            const analysisData = {
                ...formData,
                mediaInfo,
                userId: user?.uid,
                timestamp: new Date().toISOString()
            };

            // Store in sessionStorage for result page
            sessionStorage.setItem('pendingAnalysis', JSON.stringify(analysisData));

            // Navigate to result page
            navigate('/result');
        } catch (err) {
            console.error('Analysis error:', err);
            setError('Failed to analyze. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const countHashtags = (text) => {
        const matches = text.match(/#\w+/g);
        return matches ? matches.length : 0;
    };

    return (
        <div className="min-h-screen bg-luxury-light py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-luxury-black mb-3">
                        Analyze Your Content
                    </h1>
                    <p className="text-gray-600 max-w-xl mx-auto">
                        Upload your media and enter post details for AI-powered engagement prediction
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 max-w-2xl mx-auto">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Media Upload Section */}
                    <div className="glass-card p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                                <Upload className="w-5 h-5 text-gold-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-luxury-black">Media Upload</h2>
                                <p className="text-sm text-gray-500">Upload your video or image</p>
                            </div>
                        </div>

                        {!formData.file ? (
                            <div
                                className={`upload-zone ${dragOver ? 'dragover' : ''}`}
                                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                onDragLeave={() => setDragOver(false)}
                                onDrop={handleFileDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    className="hidden"
                                    onChange={handleFileDrop}
                                />
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center">
                                        <Upload className="w-8 h-8 text-gold-500" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium text-luxury-dark">
                                            Drag & drop your file here
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            or click to browse • Supports images and videos
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Preview */}
                                <div className="relative rounded-xl overflow-hidden bg-luxury-dark flex items-center justify-center" style={{ maxHeight: '150px' }}>
                                    {mediaInfo?.type === 'image' ? (
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            style={{ maxHeight: '150px', maxWidth: '200px', objectFit: 'contain' }}
                                        />
                                    ) : (
                                        <video
                                            src={preview}
                                            style={{ maxHeight: '150px', maxWidth: '200px', objectFit: 'contain' }}
                                            controls
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={removeFile}
                                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Media Info Cards */}
                                {mediaInfo && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="bg-luxury-light rounded-xl p-4 text-center">
                                            <div className="flex justify-center mb-2">
                                                {mediaInfo.orientation === 'Portrait' ? (
                                                    <Smartphone className="w-5 h-5 text-gold-500" />
                                                ) : (
                                                    <Monitor className="w-5 h-5 text-gold-500" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mb-1">Orientation</p>
                                            <p className="font-semibold text-luxury-dark">{mediaInfo.orientation}</p>
                                        </div>
                                        <div className="bg-luxury-light rounded-xl p-4 text-center">
                                            <div className="flex justify-center mb-2">
                                                {mediaInfo.type === 'image' ? (
                                                    <ImageIcon className="w-5 h-5 text-gold-500" />
                                                ) : (
                                                    <Video className="w-5 h-5 text-gold-500" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mb-1">Resolution</p>
                                            <p className="font-semibold text-luxury-dark">{mediaInfo.resolution}</p>
                                        </div>
                                        <div className="bg-luxury-light rounded-xl p-4 text-center">
                                            <p className="text-xs text-gray-500 mb-1">Aspect Ratio</p>
                                            <p className="font-semibold text-luxury-dark">{mediaInfo.aspectRatio}</p>
                                        </div>
                                        <div className={`rounded-xl p-4 text-center ${mediaInfo.qualityScore === 'High' ? 'bg-green-50' :
                                            mediaInfo.qualityScore === 'Medium' ? 'bg-yellow-50' : 'bg-red-50'
                                            }`}>
                                            <p className="text-xs text-gray-500 mb-1">Quality</p>
                                            <p className={`font-semibold ${mediaInfo.qualityScore === 'High' ? 'text-green-600' :
                                                mediaInfo.qualityScore === 'Medium' ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {mediaInfo.qualityScore}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Post Details Section */}
                    <div className="glass-card p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-gold-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-luxury-black">Post Details</h2>
                                <p className="text-sm text-gray-500">Enter your content metadata</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Caption */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-luxury-dark mb-2">
                                    Caption
                                </label>
                                <textarea
                                    value={formData.caption}
                                    onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                                    placeholder="Write your engaging caption here..."
                                    className="luxury-input min-h-[120px] resize-none"
                                    rows={4}
                                />
                                <p className="mt-2 text-sm text-gray-500">
                                    {formData.caption.length} characters
                                </p>
                            </div>

                            {/* Hashtags */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-luxury-dark mb-2">
                                    <Hash className="w-4 h-4 inline mr-1" />
                                    Hashtags
                                </label>
                                <input
                                    type="text"
                                    value={formData.hashtags}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hashtags: e.target.value }))}
                                    placeholder="#trending #viral #content"
                                    className="luxury-input"
                                />
                                <p className="mt-2 text-sm text-gray-500">
                                    {countHashtags(formData.hashtags)} hashtags detected
                                </p>
                            </div>

                            {/* Platform */}
                            <div>
                                <label className="block text-sm font-medium text-luxury-dark mb-2">
                                    Platform
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {platforms.map(p => {
                                        const IconComponent = p.icon;
                                        const isSelected = formData.platform === p.value;
                                        return (
                                            <button
                                                key={p.value}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, platform: p.value }))}
                                                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${isSelected
                                                    ? 'border-gold-500 bg-gold-50'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                                    }`}
                                                title={p.label}
                                            >
                                                <IconComponent
                                                    className="w-6 h-6"
                                                    style={{ color: isSelected ? p.color : '#6B7280' }}
                                                />
                                                <span className={`text-xs font-medium ${isSelected ? 'text-luxury-dark' : 'text-gray-500'}`}>
                                                    {p.label.split(' ')[0]}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Posting Time */}
                            <div>
                                <label className="block text-sm font-medium text-luxury-dark mb-2">
                                    <Clock className="w-4 h-4 inline mr-1" />
                                    Posting Time
                                </label>
                                <input
                                    type="time"
                                    value={formData.postingTime}
                                    onChange={(e) => setFormData(prev => ({ ...prev, postingTime: e.target.value }))}
                                    className="luxury-input"
                                />
                            </div>

                            {/* Day of Week */}
                            <div>
                                <label className="block text-sm font-medium text-luxury-dark mb-2">
                                    <Calendar className="w-4 h-4 inline mr-1" />
                                    Day of Week
                                </label>
                                <select
                                    value={formData.dayOfWeek}
                                    onChange={(e) => setFormData(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                                    className="luxury-select"
                                >
                                    <option value="">Select day</option>
                                    {days.map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Target Audience */}
                            <div>
                                <label className="block text-sm font-medium text-luxury-dark mb-2">
                                    <Users className="w-4 h-4 inline mr-1" />
                                    Target Audience
                                </label>
                                <select
                                    value={formData.targetAudience}
                                    onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
                                    className="luxury-select"
                                >
                                    <option value="">Select audience</option>
                                    {audiences.map(a => (
                                        <option key={a} value={a}>{a}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Location */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-luxury-dark mb-2">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    Location (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                                    placeholder="e.g., New York, USA"
                                    className="luxury-input"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !formData.file}
                        className="gold-button w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-6 h-6" />
                                Predict Engagement
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
