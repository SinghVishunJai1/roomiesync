import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Users, ShieldCheck } from 'lucide-react';

export default function Roommates() {
    const { user } = useAuth();
    const [roommates, setRoommates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/users/all')
            .then(res => {
                setRoommates(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-8 max-w-4xl mx-auto space-y-6 bg-neutral-950 min-h-screen text-neutral-100"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-xl flex items-center justify-center">
                    <Users size={22} />
                </div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                    Flatmates & Roommates
                </h1>
            </div>
            
            {loading ? (
                <p className="text-neutral-500">Loading roommates...</p>
            ) : roommates.length === 0 ? (
                <p className="text-neutral-400 bg-black/40 border border-neutral-800/80 p-6 rounded-3xl shadow-xl text-center backdrop-blur-xl">No roommates found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roommates.map(roommate => (
                        <motion.div 
                            whileHover={{ scale: 1.02 }}
                            key={roommate.id} 
                            className="bg-black/40 border border-neutral-800/80 p-6 rounded-3xl shadow-xl flex items-center justify-between backdrop-blur-xl hover:border-neutral-700 transition"
                        >
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg text-neutral-200 flex items-center gap-2">
                                    {roommate.name} 
                                    {roommate.id === user?.id && <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2.5 py-0.5 rounded-full font-semibold">You</span>}
                                </h3>
                                <p className="text-xs text-neutral-500 font-mono">ID: #{roommate.id} • {roommate.email}</p>
                            </div>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 ${roommate.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'}`}>
                                {roommate.role === 'ADMIN' && <ShieldCheck size={14} />}
                                {roommate.role || 'USER'}
                            </span>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}