import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Lock, Mail, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        const res = await login(email, password);
        setLoading(false);
        
        if (res.success) {
            navigate('/');
        } else {
            setError(res.message || 'Invalid credentials');
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-neutral-950 px-4 text-slate-800 dark:text-neutral-100 transition-colors duration-300">
            <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5 }}
                className="w-full max-w-md bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-neutral-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-xl"
            >
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                        <LogIn size={28} />
                    </div>
                    <h2 className="text-2xl font-black bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-400 bg-clip-text text-transparent">
                        Welcome to RoomieSync
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-neutral-400 mt-1 font-medium">
                        Sign in to manage your flat effortlessly
                    </p>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 p-3.5 rounded-2xl mb-6 text-sm font-medium text-center"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-neutral-500">
                                <Mail size={18} />
                            </span>
                            <input 
                                type="email" 
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-500 rounded-2xl focus:outline-none focus:border-cyan-500 text-sm transition-all" 
                                placeholder="name@example.com"
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 dark:text-neutral-500">
                                <Lock size={18} />
                            </span>
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-500 rounded-2xl focus:outline-none focus:border-cyan-500 text-sm transition-all" 
                                placeholder="••••••••"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)} 
                                required 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300 transition"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <motion.button 
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white py-3 rounded-2xl font-bold text-sm shadow-md transition-all duration-300 disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
}