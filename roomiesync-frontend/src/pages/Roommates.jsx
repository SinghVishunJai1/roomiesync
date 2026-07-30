import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast';
import { Users, ShieldCheck, Mail, Copy, Check, Search, UserCheck } from 'lucide-react';

export default function Roommates() {
    const { user } = useAuth();
    const [roommates, setRoommates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState('success');

    const showToast = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => setToastMessage(null), 3000);
    };

    useEffect(() => {
        api.get('/users/all')
            .then(res => {
                setRoommates(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Error fetching roommates:", err);
                setLoading(false);
            });
    }, []);

    const handleCopyEmail = (email, id) => {
        navigator.clipboard.writeText(email);
        setCopiedId(id);
        showToast(`Copied ${email} to clipboard! 📋`, 'success');
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredRoommates = roommates.filter(r => 
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const adminCount = roommates.filter(r => r.role === 'ADMIN').length;

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

            {/* Header Banner & Stats */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/5 to-cyan-600/10 dark:from-violet-600/20 dark:via-fuchsia-600/10 dark:to-cyan-600/20 p-8 rounded-3xl border border-slate-200 dark:border-neutral-800/80 backdrop-blur-xl shadow-lg">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/20 shrink-0">
                        <Users size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-400 bg-clip-text text-transparent">
                            Flatmates Directory
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium mt-1">
                            Meet your flat members, check roles, and connect instantly.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-white/80 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 px-4 py-2.5 rounded-2xl text-center shadow-sm">
                        <p className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-bold tracking-wider">Total Members</p>
                        <p className="text-lg font-black text-violet-600 dark:text-violet-400">{roommates.length}</p>
                    </div>
                    <div className="bg-white/80 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 px-4 py-2.5 rounded-2xl text-center shadow-sm">
                        <p className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-bold tracking-wider">Admins</p>
                        <p className="text-lg font-black text-amber-600 dark:text-amber-400">{adminCount}</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 dark:text-neutral-500">
                    <Search size={18} />
                </span>
                <input 
                    type="text"
                    placeholder="Search roommate by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-neutral-800/80 text-slate-800 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-500 rounded-2xl focus:outline-none focus:border-violet-500 text-sm transition-all shadow-xl backdrop-blur-xl"
                />
            </div>
            
            {/* Loading State */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white/40 dark:bg-neutral-900/40 border border-slate-200 dark:border-neutral-800 p-6 rounded-3xl animate-pulse h-32" />
                    ))}
                </div>
            ) : filteredRoommates.length === 0 ? (
                <div className="bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-neutral-800/80 p-12 rounded-3xl shadow-xl text-center backdrop-blur-xl space-y-2">
                    <Users className="mx-auto text-slate-400 dark:text-neutral-600" size={36} />
                    <p className="text-slate-600 dark:text-neutral-400 font-medium">No flatmates match your search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <AnimatePresence>
                        {filteredRoommates.map(roommate => {
                            const isCurrentUser = roommate.id === user?.id;
                            const isAdmin = roommate.role === 'ADMIN';

                            return (
                                <motion.div 
                                    layout
                                    initial={{ opacity: 0, scale: 0.96 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.96 }}
                                    whileHover={{ y: -4 }}
                                    transition={{ duration: 0.2 }}
                                    key={roommate.id} 
                                    className="bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-neutral-800/80 p-6 rounded-3xl shadow-xl flex flex-col justify-between backdrop-blur-xl hover:border-slate-300 dark:hover:border-neutral-700 transition space-y-4 relative overflow-hidden group"
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-extrabold text-lg text-slate-900 dark:text-neutral-100">
                                                    {roommate.name}
                                                </h3>
                                                {isCurrentUser && (
                                                    <span className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1">
                                                        <UserCheck size={10} /> You
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 dark:text-neutral-400 flex items-center gap-1 font-mono">
                                                <Mail size={12} className="text-slate-400" /> {roommate.email}
                                            </p>
                                        </div>

                                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider ${
                                            isAdmin 
                                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
                                                : 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 border border-slate-200 dark:border-neutral-800'
                                        }`}>
                                            {isAdmin && <ShieldCheck size={12} />}
                                            {roommate.role || 'USER'}
                                        </span>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 dark:border-neutral-800/60 flex items-center justify-between text-xs">
                                        <span className="text-[10px] font-mono text-slate-400 dark:text-neutral-500">
                                            ID: #{roommate.id}
                                        </span>
                                        <motion.button 
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleCopyEmail(roommate.email, roommate.id)}
                                            className="px-3 py-1.5 bg-slate-100 dark:bg-neutral-900/80 hover:bg-slate-200 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 rounded-xl font-semibold transition flex items-center gap-1.5 text-[11px]"
                                        >
                                            {copiedId === roommate.id ? (
                                                <>
                                                    <Check size={12} className="text-emerald-500" /> Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={12} /> Copy Email
                                                </>
                                            )}
                                        </motion.button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
}