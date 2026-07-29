import { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, CheckCircle2, DollarSign, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ActivityFeed() {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        setActivities([
            { id: 1, type: 'task', text: 'Manish completed "Clean the Kitchen"', time: '10 mins ago' },
            { id: 2, type: 'expense', text: 'Jai added ₹450 for Monthly Groceries', time: '1 hour ago' },
            { id: 3, type: 'user', text: 'Admin added Niraj to RoomieSync', time: '3 hours ago' },
        ]);
    }, []);

    return (
        <div className="bg-black/40 border border-neutral-800/80 p-6 rounded-3xl shadow-xl space-y-4 backdrop-blur-xl">
            <h2 className="text-lg font-bold text-neutral-200 flex items-center gap-2">
                <Activity className="text-cyan-400" size={20} /> Recent Flat Activity
            </h2>
            <div className="space-y-3">
                {activities.map((act, index) => (
                    <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: index * 0.1 }}
                        key={act.id} 
                        className="flex items-center justify-between p-4 bg-neutral-900/60 rounded-2xl border border-neutral-800 hover:border-neutral-700 transition"
                    >
                        <div className="flex items-center gap-3">
                            {act.type === 'task' && <CheckCircle2 className="text-emerald-400" size={18} />}
                            {act.type === 'expense' && <DollarSign className="text-amber-400" size={18} />}
                            {act.type === 'user' && <UserPlus className="text-cyan-400" size={18} />}
                            <span className="text-sm font-medium text-neutral-300">{act.text}</span>
                        </div>
                        <span className="text-xs text-neutral-500 font-medium">{act.time}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}