import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, CheckSquare } from 'lucide-react';

export default function Tasks() {
    const { user } = useAuth();
    const [tasks, setTasks] = useState([]);

    useEffect(() => {
        if (user) {
            api.get(`/tasks/user/${user.id}`)
                .then(res => setTasks(res.data))
                .catch(err => console.error(err));
        }
    }, [user]);

    const completeTask = async (taskId) => {
        try {
            await api.put(`/tasks/${taskId}/complete`);
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'Completed' } : t));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-8 max-w-4xl mx-auto space-y-6 bg-neutral-950 min-h-screen text-neutral-100"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl flex items-center justify-center">
                    <CheckSquare size={22} />
                </div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                    Your Assigned Tasks
                </h1>
            </div>
            
            {tasks.length === 0 ? (
                <p className="text-neutral-400 bg-black/40 border border-neutral-800/80 p-6 rounded-3xl shadow-xl text-center backdrop-blur-xl">
                    No tasks assigned to you right now. Chill! 🎉
                </p>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {tasks.map(task => (
                            <motion.div 
                                key={task.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="bg-black/40 border border-neutral-800/80 p-5 rounded-3xl shadow-xl flex justify-between items-center backdrop-blur-xl hover:border-neutral-700 transition"
                            >
                                <div className="space-y-1">
                                    <h3 className="font-bold text-neutral-200 text-lg">{task.title}</h3>
                                    <p className="text-sm text-neutral-400 flex items-center gap-1.5">
                                        Status: 
                                        <span className={`font-medium flex items-center gap-1 ${task.status === 'Completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {task.status === 'Completed' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                            {task.status}
                                        </span>
                                    </p>
                                </div>
                                {task.status !== 'Completed' && (
                                    <motion.button 
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => completeTask(task.id)}
                                        className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white px-5 py-2.5 rounded-2xl text-xs font-bold shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all duration-300"
                                    >
                                        Mark Completed
                                    </motion.button>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
}