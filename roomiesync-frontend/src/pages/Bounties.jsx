import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast';
import { Gift, PlusCircle, CheckCircle, ArrowUpRight, Coins, User } from 'lucide-react';

export default function Bounties() {
    const { user } = useAuth();
    const [openBounties, setOpenBounties] = useState([]);
    const [userTasks, setUserTasks] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [amount, setAmount] = useState('');

    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState('success');

    const showToast = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => {
            setToastMessage(null);
        }, 3000);
    };

    useEffect(() => {
        if (user?.id) {
            fetchOpenBounties();
            fetchUserTasks();
            fetchUsersList();
        }
    }, [user]);

    const fetchUsersList = () => {
        api.get('/users/all')
            .then(res => setUsersList(res.data))
            .catch(err => console.error(err));
    };

    const fetchUserTasks = () => {
        api.get(`/tasks/user/${user.id}`)
            .then(res => setUserTasks(res.data.filter(t => t.status !== "Completed")))
            .catch(err => console.error(err));
    };

    const fetchOpenBounties = async () => {
        try {
            const res = await api.get('/tasks/bounties/open');
            const bounties = res.data;

            const updatedBounties = await Promise.all(
                bounties.map(async (bounty) => {
                    if (bounty.taskTitle || bounty.title) return bounty;

                    try {
                        const taskRes = await api.get(`/tasks/${bounty.taskId}`);
                        return { 
                            ...bounty, 
                            taskTitle: taskRes.data.title || taskRes.data.name 
                        };
                    } catch {
                        return bounty;
                    }
                })
            );

            setOpenBounties(updatedBounties);
        } catch (err) {
            console.error("Error fetching bounties:", err);
        }
    };

    const getUserName = (userId) => {
        if (!userId) return "Flatmate";
        if (userId === user?.id) return "You";
        const foundUser = usersList.find(u => u.id === Number(userId));
        return foundUser ? foundUser.name : `User #${userId}`;
    };

    const getTaskTitle = (taskId, bounty) => {
        if (bounty?.taskTitle) return bounty.taskTitle;
        if (bounty?.title) return bounty.title;

        const foundTask = userTasks.find(t => t.id === Number(taskId));
        if (foundTask) return foundTask.title;

        const taskMap = {
            1: "Clean Kitchen",
            2: "Throw Trash & Dustbin",
            3: "Bring Weekly Groceries & Milk",
            4: "Clean Living Room & Bathroom",
            5: "Pay Electricity Bill"
        };

        return taskMap[taskId] || `Task #${taskId}`;
    };

    const handleCreateBounty = async (e) => {
        e.preventDefault();
        if (!selectedTaskId) {
            showToast("Please select a task first!", "error");
            return;
        }

        try {
            await api.post(`/tasks/${selectedTaskId}/bounty?userId=${user.id}&amount=${amount}`);
            setSelectedTaskId('');
            setAmount('');
            fetchUserTasks();
            fetchOpenBounties();
            showToast("Bounty posted successfully! 🎁", "success");
        } catch (err) {
            console.error(err);
            showToast("Failed to post bounty. Try again!", "error");
        }
    };

    const handleClaimBounty = async (bountyId) => {
        try {
            await api.put(`/tasks/bounties/${bountyId}/claim?claimingUserId=${user.id}`);
            fetchUserTasks();
            fetchOpenBounties();
            showToast("Task claimed successfully! You earned this bounty 🔥", "success");
        } catch (err) {
            console.error(err);
            showToast("Failed to claim bounty", "error");
        }
    };

    const totalCommittedDues = openBounties
        .filter(b => b.offeredByUserId === user?.id)
        .reduce((sum, b) => sum + (b.bountyAmount || b.amount || 0), 0);

    const totalClaimableEarnings = openBounties
        .filter(b => b.offeredByUserId !== user?.id)
        .reduce((sum, b) => sum + (b.bountyAmount || b.amount || 0), 0);

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-8 max-w-5xl mx-auto space-y-8 bg-slate-50 dark:bg-neutral-950 min-h-screen text-slate-800 dark:text-neutral-100 relative"
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

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-500/20 rounded-2xl flex items-center justify-center shrink-0">
                        <Gift size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-400 bg-clip-text text-transparent">
                            Bounty & Task Swap Market
                        </h1>
                        <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">Offer money to swap your tasks or earn cash by completing others' tasks!</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 rounded-3xl flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Available Market Rewards</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-neutral-100 mt-1">₹{totalClaimableEarnings}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-neutral-400">Cash you can earn by claiming open tasks</p>
                    </div>
                    <div className="w-10 h-10 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                        <Coins size={20} />
                    </div>
                </div>

                <div className="p-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 rounded-3xl flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Your Posted Bounty Dues</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-neutral-100 mt-1">₹{totalCommittedDues}</h3>
                        <p className="text-[11px] text-slate-500 dark:text-neutral-400">You will pay this amount when someone completes your task</p>
                    </div>
                    <div className="w-10 h-10 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
                        <ArrowUpRight size={20} />
                    </div>
                </div>
            </div>

            <div className="bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-neutral-800/80 p-6 rounded-3xl shadow-xl backdrop-blur-xl">
                <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-200 mb-4 flex items-center gap-2">
                    <PlusCircle size={20} className="text-cyan-600 dark:text-cyan-400" /> Post a New Task Bounty
                </h2>
                <form onSubmit={handleCreateBounty} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1.5">Select Your Task</label>
                        <select 
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 rounded-2xl focus:outline-none focus:border-cyan-500 text-sm transition-all" 
                            value={selectedTaskId} 
                            onChange={(e) => setSelectedTaskId(e.target.value)} 
                            required 
                        >
                            <option value="">-- Select Pending Task --</option>
                            {userTasks.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-400 mb-1.5">Reward Amount (₹)</label>
                        <input 
                            type="number" 
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-500 rounded-2xl focus:outline-none focus:border-cyan-500 text-sm transition-all" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            placeholder="e.g. 50"
                            required 
                        />
                    </div>
                    <motion.button 
                        whileTap={{ scale: 0.97 }} 
                        type="submit" 
                        className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white py-3 rounded-2xl font-bold text-sm shadow-md transition-all duration-300"
                    >
                        Post Bounty
                    </motion.button>
                </form>
            </div>

            <div className="bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-neutral-800/80 p-6 rounded-3xl shadow-xl space-y-4 backdrop-blur-xl">
                <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-200">Open Bounties Market</h2>
                {openBounties.length === 0 ? (
                    <p className="text-slate-500 dark:text-neutral-500 text-sm py-12 text-center">No open bounties available right now.</p>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {openBounties.map(bounty => {
                                const isSelfBounty = bounty.offeredByUserId === user?.id;
                                const rewardAmount = bounty.bountyAmount || bounty.amount || 0;
                                const displayTaskTitle = getTaskTitle(bounty.taskId, bounty);
                                const displayUserName = getUserName(bounty.offeredByUserId);

                                return (
                                    <motion.div 
                                        key={bounty.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="p-5 border border-slate-200 dark:border-neutral-800 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 bg-slate-50 dark:bg-neutral-900/60 hover:border-slate-300 dark:hover:border-neutral-700 transition"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-slate-900 dark:text-neutral-100 text-base">
                                                    {displayTaskTitle}
                                                </h3>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-neutral-400 flex items-center gap-2">
                                                <span className="flex items-center gap-1 text-slate-700 dark:text-neutral-300 font-medium">
                                                    <User size={12} /> Offered by: {displayUserName}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-6">
                                            <div className="text-right">
                                                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Bounty Reward</span>
                                                <p className="text-lg text-emerald-600 dark:text-emerald-400 font-black">
                                                    + ₹{rewardAmount}
                                                </p>
                                            </div>

                                            {isSelfBounty ? (
                                                <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                                    Your Bounty
                                                </span>
                                            ) : (
                                                <motion.button 
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleClaimBounty(bounty.id)}
                                                    className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-500 hover:text-white transition flex items-center gap-1.5 shadow-sm"
                                                >
                                                    <CheckCircle size={16} /> Claim Task & Get ₹{rewardAmount}
                                                </motion.button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </motion.div>
    );
}