import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Upload, History, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function MainLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Analyze', href: '/analyze', icon: Upload },
        { name: 'History', href: '/history', icon: History },
    ];

    const isActive = (path) => location.pathname === path;

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-luxury-light">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-luxury-gray/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 md:h-20">
                        {/* Logo */}
                        <Link to="/analyze" className="flex items-center gap-2">
                            <BarChart3 className="w-8 h-8 text-gold-500" />
                            <span className="text-xl font-bold">
                                <span className="text-luxury-black">Engage</span>
                                <span className="gold-text">Predict</span>
                            </span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center gap-1">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive(item.href)
                                                ? 'bg-gold-500 text-white shadow-luxury-gold'
                                                : 'text-luxury-dark hover:bg-luxury-light'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Menu */}
                        <div className="hidden md:flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-sm font-medium text-luxury-dark">
                                    {user?.displayName || 'User'}
                                </p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 rounded-full hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-luxury-light"
                        >
                            {mobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-luxury-gray/50 animate-in">
                        <div className="px-4 py-4 space-y-2">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${isActive(item.href)
                                                ? 'bg-gold-500 text-white'
                                                : 'text-luxury-dark hover:bg-luxury-light'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                            <hr className="border-luxury-gray/50 my-2" />
                            <div className="flex items-center justify-between px-4 py-2">
                                <div>
                                    <p className="font-medium text-luxury-dark">
                                        {user?.displayName || 'User'}
                                    </p>
                                    <p className="text-sm text-gray-500">{user?.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="pt-16 md:pt-20 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
}
