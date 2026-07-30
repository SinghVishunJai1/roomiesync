import { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, CheckCircle2, DollarSign, Gift, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ActivityFeed() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLiveActivities();
    }, []);

    const fetchLiveActivities = async () => {
        try {
            setLoading(true);
            
            const [expensesRes, bountiesRes] = await Promise.allSettled([
                api.get('/expenses/all'),
                api.get('/tasks/bounties/open')
            ]);

            const expenses = expensesRes.status === 'fulfilled' ? (expensesRes.value.data || []) : [];
            const bounties = bountiesRes.status === 'fulfilled' ? (bountiesRes.value.data || []) : [];

            const expenseActivities = expenses.map(exp => ({
                id: `exp-${exp.id}`,
                type: 'expense',
                text: `Expense logged: "${exp.description}" worth ₹${exp.amount}`,
                tag: exp.category || 'Expense',
                timestamp: exp.id
            }));

            const bountyActivities = bounties.map(b => ({
                id: `bounty-${b.id}`,
                type: 'bounty',
                text: `Open Bounty posted: "${b.taskTitle || b.title || 'Task'}" for ₹${b.bountyAmount || b.amount || 0}`,
                tag: 'Bounty',
                timestamp: b.id
            }));

            const merged = [...expenseActivities, ...bountyActivities].reverse();

            if (merged.length === 0) {
                setActivities([
                    { 
                        id: 'default-1', 
                        type: 'task', 
                        text: 'Welcome to RoomieSync! Dashboard and live feeds are up.', 
                        tag: 'System', 
                        time: 'Just now' 
                    }
                ]);
            } else {
                setActivities(merged);
            }
        } catch (err) {
            console.error("Error fetching activity feed:", err);
            setActivities([
                { 
                    id: 'fallback-1', 
                    type: 'task', 
                    text: 'Flat system active and running smoothly.', 
                    tag: 'System', 
                    time: 'Just now' 
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white/80 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800/80 p-6 rounded-3xl shadow-xl space-y-4 backdrop-blur-xl transition-colors duration-300">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-200 flex items-center gap-2">
                    <Activity className="text-cyan-600 dark:text-cyan-400" size={20} /> Recent Flat Activity
                </h2>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span> Live Feed
                </span>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-slate-100 dark:bg-neutral-950/40 border border-slate-200 dark:border-neutral-800 p-4 rounded-2xl animate-pulse h-14" />
                    ))}
                </div>
            ) : activities.length === 0 ? (
                <div className="py-8 text-center space-y-2 text-slate-400 dark:text-neutral-500">
                    <Sparkles className="mx-auto text-cyan-500" size={24} />
                    <p className="text-xs font-medium">No recent activities logged yet.</p>
                </div>
            ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    <AnimatePresence>
                        {activities.map((act, index) => (
                            <motion.div 
                                key={act.id} 
                                initial={{ opacity: 0, x: -10 }} 
                                animate={{ opacity: 1, x: 0 }} 
                                transition={{ delay: index * 0.04 }}
                                className="flex items-center justify-between p-4 bg-slate-50 dark:bg-neutral-950/60 rounded-2xl border border-slate-200 dark:border-neutral-800 hover:border-slate-300 dark:hover:border-neutral-700 transition gap-4"
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    {act.type === 'expense' && (
                                        <div className="w-8 h-8 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 flex items-center justify-center shrink-0">
                                            <DollarSign size={16} />
                                        </div>
                                    )}
                                    {act.type === 'bounty' && (
                                        <div className="w-8 h-8 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl border border-fuchsia-500/20 flex items-center justify-center shrink-0">
                                            <Gift size={16} />
                                        </div>
                                    )}
                                    {act.type === 'task' && (
                                        <div className="w-8 h-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 flex items-center justify-center shrink-0">
                                            <CheckCircle2 size={16} />
                                        </div>
                                    )}

                                    <div className="truncate">
                                        <p className="text-sm font-medium text-slate-800 dark:text-neutral-200 truncate">
                                            {act.text}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    {act.tag && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-200/60 dark:bg-neutral-800 text-slate-600 dark:text-neutral-400">
                                            {act.tag}
                                        </span>
                                    )}
                                    <span className="text-xs text-slate-400 dark:text-neutral-500 font-medium flex items-center gap-1">
                                        <Clock size={12} /> {act.time || 'Recently'}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}