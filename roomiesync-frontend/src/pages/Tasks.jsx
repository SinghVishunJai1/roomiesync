import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast';
import { CheckCircle2, Clock, CheckSquare, Sparkles, Filter, Calendar } from 'lucide-react';

export default function Tasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'COMPLETED'

    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState('success');

    const showToast = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 3000);
    };

    useEffect(() => {
        if (user?.id) {
            fetchUserTasks();
        }
    }, [user]);

    const fetchUserTasks = () => {
        setLoading(true);
        api.get(`/tasks/user/${user.id}`)
            .then(res => {
                setTasks(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching tasks:", err);
                setLoading(false);
            });
    };

    const completeTask = async (taskId, taskTitle) => {
        try {
            await api.put(`/tasks/${taskId}/complete`);
            setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'Completed' } : t));
            showToast(`Task "${taskTitle}" marked as completed! 🎉`, 'success');
        } catch (err) {
            console.error("Error completing task:", err);
            showToast('Failed to update task status.', 'error');
        }
    };

    const completedCount = tasks.filter(t => t.status === 'Completed').length;
    const pendingCount = tasks.length - completedCount;
    const completionPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

    const filteredTasks = tasks.filter(t => {
        if (filter === 'PENDING') return t.status !== 'Completed';
        if (filter === 'COMPLETED') return t.status === 'Completed';
        return true;
    });

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4 }}
            className="p-8 max-w-5xl mx-auto space-y-8 bg-slate-50 dark:bg-neutral-950 min-h-screen text-slate-800 dark:text-neutral-100 transition-colors duration-300 relative"
        >
            <AnimatePresence>
                {toastMessage && (
                    <Toast
                        message={toastMessage}
                        type={toastType}
                        onClose={() => setToastMessage(null)}
                    />
                )}
            </AnimatePresence>

            {/* Header & Overview Card */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-cyan-600/10 via-violet-600/5 to-fuchsia-600/10 dark:from-cyan-600/20 dark:via-violet-600/10 dark:to-fuchsia-600/20 p-8 rounded-3xl border border-slate-200 dark:border-neutral-800/80 backdrop-blur-xl shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-tr from-cyan-500 to-violet-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
                        <CheckSquare size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-cyan-600 via-violet-600 to-fuchsia-600 dark:from-cyan-400 dark:via-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                            Your Assigned Tasks
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium mt-1">
                            Stay on top of your household duties and daily chores.
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="bg-white/80 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 p-4 rounded-2xl min-w-[220px] shadow-sm space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-slate-600 dark:text-neutral-400 uppercase tracking-wider text-[10px]">Completion</span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-black">{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-neutral-800 rounded-full h-2 overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${completionPercentage}%` }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                            className="bg-gradient-to-r from-cyan-500 to-violet-600 h-full rounded-full"
                        />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 dark:text-neutral-500 font-medium">
                        <span>{completedCount} Done</span>
                        <span>{pendingCount} Pending</span>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 dark:border-neutral-800/80 pb-4">
                <div className="flex items-center gap-2 bg-slate-200/60 dark:bg-neutral-900/60 p-1.5 rounded-2xl border border-slate-200 dark:border-neutral-800">
                    {[
                        { key: 'ALL', label: `All (${tasks.length})` },
                        { key: 'PENDING', label: `Pending (${pendingCount})` },
                        { key: 'COMPLETED', label: `Completed (${completedCount})` }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setFilter(tab.key)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                filter === tab.key 
                                    ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-neutral-100 shadow-sm' 
                                    : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-neutral-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <span className="text-xs text-slate-400 dark:text-neutral-500 font-mono flex items-center gap-1">
                    <Filter size={12} /> Auto-synced with Admin
                </span>
            </div>

            {/* Task List Section */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white/40 dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800 p-5 rounded-3xl animate-pulse h-20" />
                    ))}
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-neutral-800/80 p-12 rounded-3xl shadow-xl text-center backdrop-blur-xl space-y-3">
                    <Sparkles className="mx-auto text-cyan-500" size={32} />
                    <h3 className="font-bold text-lg text-slate-900 dark:text-neutral-200">No tasks found!</h3>
                    <p className="text-slate-500 dark:text-neutral-400 text-xs">
                        {filter === 'ALL' 
                            ? "No tasks assigned to you right now. Time to relax! 🎉" 
                            : filter === 'PENDING' 
                                ? "Great job! You have cleared all pending tasks. 🔥" 
                                : "You haven't completed any tasks yet."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {filteredTasks.map(task => {
                            const isDone = task.status === 'Completed';

                            return (
                                <motion.div 
                                    layout
                                    key={task.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className={`p-5 rounded-3xl border shadow-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 backdrop-blur-xl transition ${
                                        isDone 
                                            ? 'bg-emerald-500/5 dark:bg-emerald-950/10 border-emerald-500/20' 
                                            : 'bg-white/80 dark:bg-black/40 border-slate-200 dark:border-neutral-800/80 hover:border-slate-300 dark:hover:border-neutral-700'
                                    }`}
                                >
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-3">
                                            <h3 className={`font-bold text-lg ${isDone ? 'line-through text-slate-400 dark:text-neutral-500' : 'text-slate-900 dark:text-neutral-100'}`}>
                                                {task.title}
                                            </h3>
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400">
                                                ID: #{task.id}
                                            </span>
                                        </div>

                                        <p className="text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-2">
                                            <span className="flex items-center gap-1 font-semibold">
                                                <Calendar size={12} /> Status:
                                            </span>
                                            <span className={`font-bold flex items-center gap-1 ${isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                                                {isDone ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                                                {task.status || 'Pending'}
                                            </span>
                                        </p>
                                    </div>

                                    {!isDone && (
                                        <motion.button 
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => completeTask(task.id, task.title)}
                                            className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 self-start sm:self-auto"
                                        >
                                            <CheckCircle2 size={16} /> Mark Completed
                                        </motion.button>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
}