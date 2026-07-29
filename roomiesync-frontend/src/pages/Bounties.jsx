import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, PlusCircle, CheckCircle } from 'lucide-react';

export default function Bounties() {
    const { user } = useAuth();
    const [openBounties, setOpenBounties] = useState([]);
    const [taskId, setTaskId] = useState('');
    const [amount, setAmount] = useState('');

    useEffect(() => {
        fetchOpenBounties();
    }, []);

    const fetchOpenBounties = () => {
        api.get('/tasks/bounties/open')
            .then(res => setOpenBounties(res.data))
            .catch(err => console.error(err));
    };

    const handleCreateBounty = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/tasks/${taskId}/bounty?userId=${user.id}&amount=${amount}`);
            setTaskId('');
            setAmount('');
            fetchOpenBounties();
            alert('Bounty created successfully!');
        } catch (err) {
            alert('Failed to create bounty');
        }
    };

    const handleClaimBounty = async (bountyId) => {
        try {
            await api.put(`/tasks/bounties/${bountyId}/claim?claimingUserId=${user.id}`);
            fetchOpenBounties();
            alert('Bounty claimed successfully!');
        } catch (err) {
            alert('Failed to claim bounty');
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-8 max-w-4xl mx-auto space-y-8 bg-neutral-950 min-h-screen text-neutral-100"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20 rounded-xl flex items-center justify-center">
                    <Gift size={22} />
                </div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                    Bounty & Task Swap Market
                </h1>
            </div>

            {/* Create Bounty Form */}
            <div className="bg-black/40 border border-neutral-800/80 p-6 rounded-3xl shadow-xl backdrop-blur-xl">
                <h2 className="text-lg font-bold text-neutral-200 mb-4 flex items-center gap-2">
                    <PlusCircle size={20} className="text-cyan-400" /> Post a New Bounty
                </h2>
                <form onSubmit={handleCreateBounty} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Task ID</label>
                        <input 
                            type="number" 
                            className="w-full px-4 py-3 bg-neutral-900/80 border border-neutral-800 text-neutral-200 placeholder-neutral-500 rounded-2xl focus:outline-none focus:border-cyan-500 text-sm transition-all" 
                            value={taskId} 
                            onChange={(e) => setTaskId(e.target.value)} 
                            placeholder="Task ID"
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Reward (₹)</label>
                        <input 
                            type="number" 
                            className="w-full px-4 py-3 bg-neutral-900/80 border border-neutral-800 text-neutral-200 placeholder-neutral-500 rounded-2xl focus:outline-none focus:border-cyan-500 text-sm transition-all" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            placeholder="Amount"
                            required 
                        />
                    </div>
                    <motion.button 
                        whileTap={{ scale: 0.97 }} 
                        type="submit" 
                        className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white py-3 rounded-2xl font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300"
                    >
                        Post Bounty
                    </motion.button>
                </form>
            </div>

            {/* Open Bounties List */}
            <div className="bg-black/40 border border-neutral-800/80 p-6 rounded-3xl shadow-xl space-y-4 backdrop-blur-xl">
                <h2 className="text-lg font-bold text-neutral-200">Open Bounties</h2>
                {openBounties.length === 0 ? (
                    <p className="text-neutral-500 text-sm py-12 text-center">No open bounties available right now.</p>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {openBounties.map(bounty => (
                                <motion.div 
                                    key={bounty.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="p-5 border border-neutral-800 rounded-2xl flex justify-between items-center bg-neutral-900/60 hover:border-neutral-700 transition"
                                >
                                    <div>
                                        <h3 className="font-bold text-neutral-200">Task ID: {bounty.taskId}</h3>
                                        <p className="text-sm text-emerald-400 font-bold mt-0.5">Reward: ₹{bounty.amount}</p>
                                    </div>
                                    <motion.button 
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleClaimBounty(bounty.id)}
                                        className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-500/20 transition flex items-center gap-1.5 shadow-sm"
                                    >
                                        <CheckCircle size={16} /> Claim
                                    </motion.button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.div>
    );
}