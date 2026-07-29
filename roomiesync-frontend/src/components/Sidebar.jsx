import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, CheckSquare, Gift, DollarSign, Users, ShieldCheck, LogOut, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) return null;

    const navItems = [
        { name: 'Dashboard', path: '/', icon: Home },
        { name: 'Tasks', path: '/tasks', icon: CheckSquare },
        { name: 'Bounties', path: '/bounties', icon: Gift },
        { name: 'Expenses', path: '/expenses', icon: DollarSign },
        { name: 'Roommates', path: '/roommates', icon: Users },
    ];

    if (user.role === 'ADMIN') {
        navItems.push({ name: 'Admin Panel', path: '/admin', icon: ShieldCheck });
    }

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    return (
        <>
            {/* Mobile Backdrop Overlay when sidebar is open */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.aside 
                className={`fixed md:sticky top-0 left-0 z-50 w-64 bg-black/95 backdrop-blur-xl border-r border-neutral-800/80 h-screen flex flex-col justify-between text-neutral-200 shadow-2xl shrink-0 transition-transform duration-300 md:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div>
                    {/* Logo & Mobile Close Button */}
                    <div className="p-6 border-b border-neutral-800/80 flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">
                                RoomieSync 🏡
                            </h1>
                            <p className="text-xs text-neutral-400 mt-1 font-medium">Flat Management Portal</p>
                        </div>
                        <button onClick={onClose} className="md:hidden text-neutral-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Nav Items */}
                    <nav className="p-4 space-y-2 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            
                            return (
                                <NavLink
                                    key={item.name}
                                    to={item.path}
                                    onClick={() => { if (window.innerWidth < 768) onClose(); }}
                                    className={`relative flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                                        isActive ? 'text-cyan-400' : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-900/60'
                                    }`}
                                >
                                    {isActive && (
                                        <motion.div 
                                            layoutId="activeSidebarTab" 
                                            className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 rounded-2xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)]" 
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative z-10 flex items-center gap-3.5">
                                        <Icon size={18} className={isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]' : 'text-neutral-400'} />
                                        {item.name}
                                    </span>
                                </NavLink>
                            );
                        })}
                    </nav>
                </div>

                {/* User Profile & Logout Footer */}
                <div className="p-4 border-t border-neutral-800/80 bg-neutral-950/60 m-4 rounded-2xl space-y-3 backdrop-blur-md">
                    <div>
                        <p className="text-xs font-bold text-neutral-200 truncate">{user.name}</p>
                        <p className="text-[10px] text-neutral-400 truncate">{user.email}</p>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl text-xs font-bold transition-all duration-200 border border-rose-500/20 shadow-sm"
                    >
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </motion.aside>
        </>
    );
}