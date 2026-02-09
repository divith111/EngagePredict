import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Sparkles, TrendingUp, Zap, ArrowRight } from 'lucide-react';

export default function Landing() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-gold-500" />
              <span className="text-xl font-bold">
                <span className="text-luxury-black">Engage</span>
                <span className="gold-text">Predict</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <Link
                  to="/analyze"
                  className="gold-button text-sm"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-5 py-2 text-sm font-medium text-luxury-dark hover:text-gold-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="gold-button text-sm"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 md:pt-40 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-50 rounded-full mb-8 animate-in">
              <Sparkles className="w-4 h-4 text-gold-500" />
              <span className="text-sm font-medium text-gold-700">
                AI-Powered Engagement Analytics
              </span>
            </div>

            {/* Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6 animate-in" style={{ animationDelay: '0.1s' }}>
              <span className="text-luxury-black">Engage</span>
              <span className="gold-text">Predict</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-4 animate-in" style={{ animationDelay: '0.2s' }}>
              Predict engagement. Engineer virality.
            </p>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto mb-10 animate-in" style={{ animationDelay: '0.3s' }}>
              Built for creators who treat content like a system — not luck.
              Analyze your posts with ML-powered insights and actionable recommendations.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in" style={{ animationDelay: '0.4s' }}>
              <Link
                to={isAuthenticated ? "/analyze" : "/signup"}
                className="gold-button flex items-center gap-2 text-lg px-8 py-4"
              >
                Start Analyzing
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Stats Section */}
          <div className="mt-20 md:mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 animate-in" style={{ animationDelay: '0.5s' }}>
            {[
              { value: '95%', label: 'Prediction Accuracy', icon: TrendingUp },
              { value: '40%', label: 'Avg. Engagement Boost', icon: Zap },
              { value: '5+', label: 'Platforms Supported', icon: BarChart3 },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className="glass-card p-8 text-center hover:shadow-luxury-lg transition-shadow"
              >
                <stat.icon className="w-10 h-10 mx-auto mb-4 text-gold-500" />
                <div className="text-4xl md:text-5xl font-bold gold-text mb-2">
                  {stat.value}
                </div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <section id="features" className="mt-32 md:mt-40">
            <div className="text-center mb-16 animate-in" style={{ animationDelay: '0.6s' }}>
              <h2 className="text-3xl md:text-4xl font-bold text-luxury-black mb-4">
                How It Works
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Three simple steps to predict and optimize your content's engagement potential.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Upload Content',
                  description: 'Upload your video or image. We automatically detect resolution, orientation, and quality metrics.',
                },
                {
                  title: 'Add Details',
                  description: 'Enter your caption, hashtags, posting time, and target platform for a comprehensive analysis.',
                },
                {
                  title: 'Get Predictions',
                  description: 'Receive an engagement score with actionable recommendations to maximize your reach.',
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className="glass-card p-8 group hover:shadow-luxury-lg hover:-translate-y-2 transition-all duration-300 animate-in"
                  style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                >
                  <h3 className="text-xl font-bold text-luxury-black mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="mt-32 md:mt-40 text-center">
            <div className="glass-card p-12 md:p-16 bg-gradient-to-br from-gold-50 to-white">
              <h2 className="text-3xl md:text-4xl font-bold text-luxury-black mb-4">
                Ready to Go Viral?
              </h2>
              <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
                Join thousands of creators using EngagePredict to optimize their content strategy.
              </p>
              <Link
                to={isAuthenticated ? "/analyze" : "/signup"}
                className="gold-button inline-flex items-center gap-2 text-lg px-8 py-4"
              >
                Start Free Analysis
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-luxury-gray/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2026 EngagePredict. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
