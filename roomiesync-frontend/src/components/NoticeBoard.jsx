import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Pin, Trash2, MessageSquareText } from 'lucide-react';

export default function NoticeBoard() {
    const { user } = useAuth();
    const [notices, setNotices] = useState([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotices();
        const interval = setInterval(() => {
            fetchNotices();
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const fetchNotices = () => {
        api.get('/notices/all')
            .then(res => {
                setNotices(res.data);
                setLoading(false);
            })
            .catch(() => {
                const saved = localStorage.getItem('roomiesync_notices');
                if (saved) {
                    setNotices(JSON.parse(saved));
                } else {
                    const defaultNotices = [
                        { id: 1, author: 'Admin (Settlement Head)', content: 'Welcome to RoomieSync! Please clear your monthly dues on time.', time: '1 day ago' },
                        { id: 2, author: user?.name || 'Roommate', content: 'Groceries bill updated for this week. Check expenses tab!', time: '2 hours ago' }
                    ];
                    setNotices(defaultNotices);
                }
                setLoading(false);
            });
    };

    const handlePostNotice = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        const newNotice = {
            author: user?.name || 'Flatmate',
            content: content.trim(),
            time: 'Just now'
        };

        try {
            await api.post('/notices/add', newNotice);
            setContent('');
            fetchNotices();
        } catch (err) {
            console.error("API error, saving locally fallback:", err);
            const localNotice = { id: Date.now(), ...newNotice };
            const updated = [localNotice, ...notices];
            setNotices(updated);
            localStorage.setItem('roomiesync_notices', JSON.stringify(updated));
            setContent('');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/notices/delete/${id}`);
            fetchNotices();
        } catch (err) {
            console.error("Delete error, filtering local state:", err);
            const updated = notices.filter(n => n.id !== id);
            setNotices(updated);
            localStorage.setItem('roomiesync_notices', JSON.stringify(updated));
        }
    };

    return (
        <div className="bg-white/80 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800/80 p-6 rounded-3xl shadow-xl backdrop-blur-xl space-y-5 transition-colors duration-300">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-200 flex items-center gap-2">
                    <Pin className="text-fuchsia-600 dark:text-fuchsia-400" size={20} /> Flat Notice Board & Reminders
                </h2>
                <span className="text-xs bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400 border border-fuchsia-500/20 px-3 py-1 rounded-full font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse"></span> Live Sync
                </span>
            </div>

            <form onSubmit={handlePostNotice} className="flex gap-2">
                <input 
                    type="text" 
                    placeholder="Drop a note for your flatmates (e.g., Dinner is ready!)"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-600 rounded-2xl focus:outline-none focus:border-fuchsia-500 text-sm transition-all"
                />
                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="bg-gradient-to-r from-fuchsia-600 to-violet-600 hover:from-fuchsia-500 hover:to-violet-500 text-white px-5 rounded-2xl font-bold transition flex items-center justify-center shadow-md shrink-0"
                >
                    <Send size={16} />
                </motion.button>
            </form>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {loading ? (
                    <div className="py-8 text-center text-xs text-slate-400 animate-pulse">Syncing Notice Board...</div>
                ) : notices.length === 0 ? (
                    <div className="py-8 text-center space-y-2 text-slate-400 dark:text-neutral-600">
                        <MessageSquareText size={28} className="mx-auto" />
                        <p className="text-xs font-medium">No active notes. Post the first message!</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {notices.map((notice) => (
                            <motion.div 
                                key={notice.id || notice.content}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="p-4 bg-slate-50 dark:bg-neutral-950/60 border border-slate-200 dark:border-neutral-800/80 rounded-2xl flex justify-between items-start gap-4 hover:border-slate-300 dark:hover:border-neutral-700 transition"
                            >
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400">{notice.author}</span>
                                        <span className="text-[10px] text-slate-500 dark:text-neutral-500">• {notice.time || 'Recently'}</span>
                                    </div>
                                    <p className="text-sm text-slate-800 dark:text-neutral-200 font-medium">{notice.content}</p>
                                </div>
                                <motion.button 
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDelete(notice.id)}
                                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition p-1"
                                    title="Delete note"
                                >
                                    <Trash2 size={14} />
                                </motion.button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}