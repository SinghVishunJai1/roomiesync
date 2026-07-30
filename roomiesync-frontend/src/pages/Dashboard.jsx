import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { CheckSquare, Gift, DollarSign, ShieldCheck } from 'lucide-react';
import ActivityFeed from '../components/ActivityFeed';
import NoticeBoard from '../components/NoticeBoard';

export default function Dashboard() {
    const { user } = useAuth();

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="p-8 max-w-6xl mx-auto space-y-8 bg-slate-50 dark:bg-neutral-950 min-h-screen text-slate-800 dark:text-neutral-100"
        >
            <div className="bg-gradient-to-r from-violet-600/15 via-fuchsia-600/10 to-cyan-600/15 dark:from-violet-600/30 dark:via-fuchsia-600/20 dark:to-cyan-600/30 p-8 rounded-3xl border border-slate-200 dark:border-neutral-800/80 shadow-lg backdrop-blur-xl flex justify-between items-center relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-black mb-2 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-400 bg-clip-text text-transparent">
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="text-slate-600 dark:text-neutral-400 text-sm font-medium">Manage your flat tasks, split bills, and bounties seamlessly in style.</p>
                </div>
                {user?.role === 'ADMIN' && (
                    <span className="relative z-10 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
                        <ShieldCheck size={16} /> Admin Mode
                    </span>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link to="/tasks" className="block bg-white dark:bg-black/40 border border-slate-200 dark:border-neutral-800/80 p-6 rounded-3xl shadow-xl hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)] transition-all duration-300 backdrop-blur-xl group">
                        <div className="w-12 h-12 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition">
                            <CheckSquare size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-200 mb-1">Tasks & Chores</h2>
                        <p className="text-slate-600 dark:text-neutral-400 text-sm">View assigned daily chores and mark them complete.</p>
                    </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link to="/bounties" className="block bg-white dark:bg-black/40 border border-slate-200 dark:border-neutral-800/80 p-6 rounded-3xl shadow-xl hover:border-fuchsia-500/50 hover:shadow-[0_0_25px_rgba(217,70,239,0.15)] transition-all duration-300 backdrop-blur-xl group">
                        <div className="w-12 h-12 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-[0_0_15px_rgba(217,70,239,0.3)] transition">
                            <Gift size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-200 mb-1">Bounty Market</h2>
                        <p className="text-slate-600 dark:text-neutral-400 text-sm">Swap tasks or claim cash rewards from flatmates.</p>
                    </Link>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Link to="/expenses" className="block bg-white dark:bg-black/40 border border-slate-200 dark:border-neutral-800/80 p-6 rounded-3xl shadow-xl hover:border-violet-500/50 hover:shadow-[0_0_25px_rgba(139,92,246,0.15)] transition-all duration-300 backdrop-blur-xl group">
                        <div className="w-12 h-12 bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition">
                            <DollarSign size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-200 mb-1">Expenses & Dues</h2>
                        <p className="text-slate-600 dark:text-neutral-400 text-sm">Track shared grocery bills and pending split dues.</p>
                    </Link>
                </motion.div>
            </div>

            <div className="mt-6">
                <NoticeBoard />
            </div>

            <div className="mt-6">
                <ActivityFeed />
            </div>
        </motion.div>
    );
}