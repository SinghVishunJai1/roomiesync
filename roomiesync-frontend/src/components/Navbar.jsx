import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, CheckSquare, Gift, DollarSign, Users, ShieldCheck, LogOut } from 'lucide-react';

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null;

    const navLinks = [
        { name: 'Home', path: '/', icon: Home },
        { name: 'Tasks', path: '/tasks', icon: CheckSquare },
        { name: 'Bounties', path: '/bounties', icon: Gift },
        { name: 'Expenses', path: '/expenses', icon: DollarSign },
        { name: 'Roommates', path: '/roommates', icon: Users },
    ];

    if (user.role === 'ADMIN') {
        navLinks.push({ name: 'Admin Panel', path: '/admin', icon: ShieldCheck });
    }

    return (
        <motion.nav 
            initial={{ y: -20, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            className="bg-black/80 backdrop-blur-xl sticky top-0 z-50 border-b border-neutral-800/80 px-6 py-3.5 flex justify-between items-center shadow-xl"
        >
            <Link to="/" className="text-xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent tracking-wide">
                RoomieSync 🏡
            </Link>

            <div className="hidden md:flex items-center gap-1 bg-neutral-900/80 p-1.5 rounded-2xl border border-neutral-800">
                {navLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = location.pathname === link.path;
                    return (
                        <Link 
                            key={link.path} 
                            to={link.path}
                            className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5 ${
                                isActive ? 'text-cyan-400' : 'text-neutral-400 hover:text-neutral-200'
                            }`}
                        >
                            {isActive && (
                                <motion.div 
                                    layoutId="activeTab" 
                                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-violet-500/10 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]" 
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-1.5">
                                <Icon size={15} className={isActive ? 'text-cyan-400 drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]' : 'text-neutral-400'} /> 
                                {link.name}
                            </span>
                        </Link>
                    );
                })}
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-neutral-200">{user.name}</p>
                    <p className="text-[10px] text-neutral-400 capitalize">{user.role || 'User'}</p>
                </div>
                
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout} 
                    className="bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                    <LogOut size={14} /> Logout
                </motion.button>
            </div>
        </motion.nav>
    );
}