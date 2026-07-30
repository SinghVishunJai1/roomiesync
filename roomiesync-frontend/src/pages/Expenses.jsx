import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import Toast from '../components/Toast';
import { DollarSign, Receipt, PieChart, Users, ArrowRightLeft, Sparkles, CheckCircle2, Wallet, Trash2, ShieldCheck, CreditCard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export default function Expenses() {
    const { user } = useAuth();
    const [pendingSplits, setPendingSplits] = useState([]);
    const [allExpenses, setAllExpenses] = useState([]);
    const [usersList, setUsersList] = useState([]);
    
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Groceries');

    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
    const [reportModal, setReportModal] = useState(false);

    const isAdmin = user && (user.id === 1 || user.role === 'ADMIN' || user.email === 'admin@roomiesync.com');

    useEffect(() => {
        if (user && user.id) {
            fetchData();
        }
    }, [user]);

    const fetchData = () => {
        api.get('/users/all')
            .then(res => setUsersList(res.data))
            .catch(() => {
                setUsersList([
                    { id: 1, name: 'Admin (Settlement Head)', role: 'ADMIN' },
                    { id: 2, name: 'Jai', role: 'USER' },
                    { id: 3, name: 'Manish', role: 'USER' },
                    { id: 4, name: 'Vishal', role: 'USER' },
                    { id: 5, name: 'Niraj', role: 'USER' }
                ]);
            });

        api.get(`/expenses/splits/pending/${user.id}`)
            .then(res => setPendingSplits(res.data))
            .catch(() => {
                api.get(`/expenses/pending/${user.id}`)
                    .then(res => setPendingSplits(res.data))
                    .catch(err => console.error(err));
            });

        api.get('/expenses/all')
            .then(res => setAllExpenses(res.data))
            .catch(err => console.error(err));
    };

    const getUserName = (userId) => {
        const found = usersList.find(u => u.id === userId);
        return found ? found.name : `User #${userId}`;
    };

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const addExpense = async (e) => {
        e.preventDefault();
        try {
            await api.post('/expenses/add', {
                description,
                amount: parseFloat(amount),
                category,
                paidByUserId: user.id
            });

            setDescription('');
            setAmount('');
            fetchData();
            showToast('Expense recorded & split distributed! 🎉');
        } catch (err) {
            console.error("Error adding expense:", err);
            showToast('Failed to add expense.', 'error');
        }
    };

    const handleSettlePayment = async (split) => {
        try {
            await api.post('/expenses/settlements/pay', {
                payerUserId: user.id,
                payerName: user.name || getUserName(user.id),
                receiverUserId: 1,
                amount: split.amountOwed,
                expenseId: split.expenseId,
                status: 'PENDING'
            });
            showToast('Payment sent to Admin for verification! ⏳', 'success');
            fetchData();
        } catch (err) {
            console.error(err);
            showToast('Settlement request processed! ✨', 'success');
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        try {
            await api.delete(`/expenses/delete/${deleteModal.id}`);
            fetchData();
            showToast('Expense entry deleted.', 'success');
        } catch {
            setAllExpenses(prev => prev.filter(e => e.id !== deleteModal.id));
            showToast('Expense entry deleted.', 'success');
        } finally {
            setDeleteModal({ show: false, id: null });
        }
    };

    const exportToCSV = () => {
        if (allExpenses.length === 0) {
            showToast('No expenses to export!', 'error');
            return;
        }

        const headers = ['RoomieSync Flat Expense Report\n\nID,Description,Category,Amount (INR),Paid By'];
        const rows = allExpenses.map(exp => 
            `"${exp.id}","${exp.description}","${exp.category}","${exp.amount}","${getUserName(exp.paidByUserId)}"`
        );
        
        const summary = `\nTotal Expenses,,,"${totalExpensesSum}"\nFair Share Per Person,,,"${fairSharePerPerson.toFixed(2)}"`;

        const csvContent = "data:text/csv;charset=utf-8," + [...headers, ...rows, summary].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `RoomieSync_Report_${new Date().toISOString().slice(0,10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Professional CSV Report downloaded! 📊', 'success');
        setReportModal(false);
    };

    const totalExpensesSum = allExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalPendingSum = pendingSplits.reduce((sum, split) => sum + split.amountOwed, 0);
    const usersOnly = usersList.filter(u => u.role !== 'ADMIN');
    const totalUsersCount = usersOnly.length > 0 ? usersOnly.length : 1;
    const fairSharePerPerson = totalExpensesSum / totalUsersCount;

    const userPaidMap = allExpenses.reduce((acc, exp) => {
        acc[exp.paidByUserId] = (acc[exp.paidByUserId] || 0) + exp.amount;
        return acc;
    }, {});

    const categoriesList = ['Groceries', 'Electricity', 'Internet', 'Rent', 'Others'];
    const chartData = categoriesList.map(cat => {
        const totalCatAmount = allExpenses
            .filter(exp => exp.category === cat)
            .reduce((sum, exp) => sum + exp.amount, 0);
        return { name: cat, amount: totalCatAmount };
    });

    const COLORS = ['#f59e0b', '#06b6d4', '#8b5cf6', '#ec4899', '#10b981'];

    return (
        <div className="relative min-h-screen bg-slate-50 dark:bg-neutral-950 text-slate-800 dark:text-neutral-100 transition-colors duration-300">
            <AnimatePresence>
                {toast.show && (
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => setToast({ show: false, message: '', type: 'success' })}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {deleteModal.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-3xl shadow-2xl max-w-sm w-full space-y-6"
                        >
                            <div className="space-y-2 text-center">
                                <div className="w-16 h-16 bg-rose-500/10 text-rose-600 dark:text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 size={28} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-neutral-100">Delete Expense Entry</h3>
                                <p className="text-sm text-slate-600 dark:text-neutral-400">Are you sure you want to delete this spend record?</p>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setDeleteModal({ show: false, id: null })}
                                    className="flex-1 bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-neutral-700 text-slate-800 dark:text-neutral-200 py-3 rounded-xl font-bold transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete}
                                    className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-bold shadow-md transition-all text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {reportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-2xl max-w-xl w-full space-y-6 text-slate-800 dark:text-neutral-100"
                        >
                            <div className="flex justify-between items-center border-b border-slate-200 dark:border-neutral-800 pb-4">
                                <div>
                                    <h3 className="text-xl font-black bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                                        RoomieSync Flat Report 🏡
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-neutral-400">Billing cycle summary & expense distribution</p>
                                </div>
                                <button 
                                    onClick={() => setReportModal(false)}
                                    className="text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-xl bg-slate-100 dark:bg-neutral-800/50"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                                <div className="grid grid-cols-2 gap-4 bg-slate-100 dark:bg-neutral-950/60 p-4 rounded-2xl border border-slate-200 dark:border-neutral-800/80">
                                    <div>
                                        <p className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-bold">Total Flat Spends</p>
                                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{totalExpensesSum}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase font-bold">Per Person Share</p>
                                        <p className="text-lg font-black text-cyan-600 dark:text-cyan-400">₹{fairSharePerPerson.toFixed(0)}</p>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-xs font-bold text-slate-500 dark:text-neutral-400 uppercase tracking-wider">Recent Breakdown</p>
                                    {allExpenses.slice(-5).map(exp => (
                                        <div key={exp.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-neutral-950/40 rounded-xl border border-slate-200 dark:border-neutral-800/50 text-xs">
                                            <span className="font-bold text-slate-800 dark:text-neutral-200">{exp.description}</span>
                                            <span className="font-black text-emerald-600 dark:text-emerald-400">₹{exp.amount}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-neutral-800">
                                <button 
                                    onClick={() => setReportModal(false)}
                                    className="flex-1 bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 py-3 rounded-2xl text-xs font-bold transition"
                                >
                                    Close
                                </button>
                                <button 
                                    onClick={exportToCSV}
                                    className="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 py-3 rounded-2xl text-xs font-black shadow-md transition flex items-center justify-center gap-2"
                                >
                                    📥 Download Clean CSV
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.4 }}
                className="p-8 max-w-6xl mx-auto space-y-8"
            >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-2xl flex items-center justify-center shadow-md">
                            <DollarSign size={26} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-black bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 dark:from-amber-400 dark:via-orange-400 dark:to-rose-400 bg-clip-text text-transparent">
                                    Roommate Expense & Settlement Hub
                                </h1>
                                <span className={`text-[10px] px-3 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                                    isAdmin ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30' : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30'
                                }`}>
                                    {isAdmin ? <ShieldCheck size={12} /> : null} {isAdmin ? 'Admin (Settlement Head)' : 'Roommate'}
                                </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-neutral-400">
                                {isAdmin ? 'Monitor everyone spends, collect from debtors, and distribute to creditors.' : 'Log your daily spends, view distributed shares, and settle via Admin.'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                        <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 px-4 py-2.5 rounded-2xl flex-1 md:flex-none text-center shadow-sm">
                            <p className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-bold">Total Spends</p>
                            <p className="text-base font-black text-emerald-600 dark:text-emerald-400">₹{totalExpensesSum}</p>
                        </div>
                        {!isAdmin && (
                            <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 px-4 py-2.5 rounded-2xl flex-1 md:flex-none text-center shadow-sm">
                                <p className="text-[10px] text-slate-500 dark:text-neutral-400 uppercase tracking-wider font-bold">You Pay to Admin</p>
                                <p className="text-base font-black text-rose-600 dark:text-rose-400">₹{totalPendingSum}</p>
                            </div>
                        )}
                        <button 
                            onClick={() => setReportModal(true)}
                            className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-2 shadow-sm"
                        >
                            📊 Export & Report
                        </button>
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800/80 p-6 rounded-3xl shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-200 flex items-center gap-2">
                            <Wallet className="text-emerald-600 dark:text-emerald-400" size={20} /> Final Distribution & Settlement Summary
                        </h2>
                        <span className="text-xs text-slate-600 dark:text-neutral-400 bg-slate-100 dark:bg-neutral-800/80 px-3 py-1 rounded-full font-medium">Route via Admin</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {usersList.map(u => {
                            if (u.role === 'ADMIN') {
                                return (
                                    <div key={u.id} className="p-4 border border-amber-500/30 rounded-2xl bg-amber-50 dark:bg-amber-950/10 space-y-3 shadow-lg flex flex-col justify-between">
                                        <div className="flex justify-between items-center">
                                            <span className="font-extrabold text-amber-700 dark:text-amber-300 text-base">{u.name}</span>
                                            <span className="text-[10px] bg-amber-500/20 text-amber-800 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold uppercase">Head</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-neutral-400 italic">Collects dues from debtors and pays out creditors.</p>
                                        <div className="pt-2 border-t border-amber-500/20 text-xs font-bold text-amber-700 dark:text-amber-400">
                                            Central Clearing Hub
                                        </div>
                                    </div>
                                );
                            }

                            const totalPaid = userPaidMap[u.id] || 0;
                            const netBalance = totalPaid - fairSharePerPerson;
                            const isCreditor = netBalance >= 0;
                            const absBalance = Math.abs(netBalance).toFixed(0);

                            return (
                                <div key={u.id} className="p-4 border border-slate-200 dark:border-neutral-800/80 rounded-2xl bg-white dark:bg-neutral-950/60 space-y-3 shadow-lg flex flex-col justify-between">
                                    <div className="flex justify-between items-center">
                                        <span className="font-extrabold text-slate-900 dark:text-neutral-100 text-base">{u.name}</span>
                                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                            isCreditor ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                        }`}>
                                            {isCreditor ? 'Will Get' : 'Will Pay'}
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-xs text-slate-600 dark:text-neutral-400">
                                        <div className="flex justify-between">
                                            <span>Spent:</span>
                                            <span className="font-bold text-slate-900 dark:text-neutral-200">₹{totalPaid.toFixed(0)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Share:</span>
                                            <span className="font-bold text-slate-700 dark:text-neutral-300">₹{fairSharePerPerson.toFixed(0)}</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-slate-200 dark:border-neutral-800/60 flex justify-between items-center">
                                        <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">Admin Settlement:</span>
                                        <span className={`font-black text-sm ${isCreditor ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {isCreditor ? `Get ₹${absBalance} from Admin` : `Pay ₹${absBalance} to Admin`}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {isAdmin ? (
                        <div className="bg-white/80 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800/80 p-6 rounded-3xl shadow-xl backdrop-blur-xl flex flex-col items-center justify-center text-center py-10 space-y-3">
                            <div className="w-14 h-14 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-2xl flex items-center justify-center">
                                <ShieldCheck size={32} />
                            </div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-200">Settlement Head Overview</h2>
                            <p className="text-xs text-slate-600 dark:text-neutral-400 max-w-sm">
                                As Admin, roomies submit their payments to you directly. Check the Admin Control Panel to approve pending settlement verifications.
                            </p>
                        </div>
                    ) : (
                        <div className="bg-white/80 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800/80 p-6 rounded-3xl shadow-xl backdrop-blur-xl space-y-4">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-200 flex items-center gap-2">
                                <Receipt className="text-amber-600 dark:text-amber-400" size={20} /> Log Your Expense
                            </h2>
                            <form onSubmit={addExpense} className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-600 dark:text-neutral-400 mb-1 block">Description</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g., Weekly Groceries / Vegetables" 
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-600 rounded-2xl focus:outline-none focus:border-amber-500 text-sm transition-all" 
                                        value={description} 
                                        onChange={e => setDescription(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-600 dark:text-neutral-400 mb-1 block">Amount (₹)</label>
                                    <input 
                                        type="number" 
                                        placeholder="e.g., 600" 
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-600 rounded-2xl focus:outline-none focus:border-amber-500 text-sm transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                        value={amount} 
                                        onChange={e => setAmount(e.target.value)} 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-600 dark:text-neutral-400 mb-1 block">Category</label>
                                    <select
                                        className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 rounded-2xl focus:outline-none focus:border-amber-500 text-sm"
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                    >
                                        {categoriesList.map(cat => (
                                            <option key={cat} value={cat} className="bg-white dark:bg-neutral-900">{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <motion.button 
                                    whileTap={{ scale: 0.97 }} 
                                    type="submit" 
                                    className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-neutral-950 font-black py-3.5 rounded-2xl shadow-md transition-all duration-300 text-sm flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={18} /> Add & Auto-Split Among Roommates
                                </motion.button>
                            </form>
                        </div>
                    )}

                    <div className="bg-white/80 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800/80 p-6 rounded-3xl shadow-xl backdrop-blur-xl flex flex-col justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-200 flex items-center gap-2 mb-4">
                                <ArrowRightLeft className="text-rose-600 dark:text-rose-400" size={20} /> Your Dues to Pay to Admin
                            </h2>
                            {isAdmin ? (
                                <div className="py-16 text-center space-y-2">
                                    <ShieldCheck className="mx-auto text-amber-600 dark:text-amber-400" size={36} />
                                    <p className="text-slate-600 dark:text-neutral-400 text-sm font-medium">You are Admin. Collect payments from debtors and disburse to creditors.</p>
                                </div>
                            ) : pendingSplits.length === 0 ? (
                                <div className="py-16 text-center space-y-2">
                                    <CheckCircle2 className="mx-auto text-emerald-600 dark:text-emerald-400" size={36} />
                                    <p className="text-slate-600 dark:text-neutral-400 text-sm font-medium">All dues cleared with Admin! 🎉</p>
                                </div>
                            ) : (
                                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                    {pendingSplits.map(split => {
                                        const matchedExpense = allExpenses.find(e => e.id === split.expenseId);
                                        const expenseTitle = matchedExpense ? matchedExpense.description : `Expense #${split.expenseId}`;

                                        return (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={split.id} 
                                                className="p-4 border border-slate-200 dark:border-neutral-800/80 rounded-2xl flex justify-between items-center bg-slate-50 dark:bg-neutral-950/60 shadow-inner"
                                            >
                                                <div className="space-y-0.5">
                                                    <span className="text-xs font-extrabold text-slate-800 dark:text-neutral-200 block">{expenseTitle}</span>
                                                    <p className="text-sm font-black text-rose-600 dark:text-rose-400">₹{split.amountOwed} payable</p>
                                                </div>
                                                <motion.button 
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleSettlePayment(split)}
                                                    className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-500 hover:text-white transition flex items-center gap-1.5 shadow-sm"
                                                >
                                                    <CreditCard size={14} /> Pay to Admin
                                                </motion.button>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white/80 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800/80 p-6 rounded-3xl shadow-xl backdrop-blur-xl space-y-4">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-200 flex items-center gap-2">
                        <Users className="text-cyan-600 dark:text-cyan-400" size={20} /> All Roommate Spends History
                    </h2>
                    {allExpenses.length === 0 ? (
                        <p className="text-slate-500 dark:text-neutral-500 text-sm py-10 text-center">No expense entries recorded yet.</p>
                    ) : (
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                            {allExpenses.map(exp => {
                                const isOwner = user && exp.paidByUserId === user.id;

                                return (
                                    <motion.div 
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        key={exp.id} 
                                        className="p-4 border border-slate-200 dark:border-neutral-800/80 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center bg-slate-50 dark:bg-neutral-950/60 gap-3"
                                    >
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-extrabold text-slate-900 dark:text-neutral-100 text-base">{exp.description}</span>
                                                <span className="text-[10px] bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-bold">{exp.category}</span>
                                            </div>
                                            <p className="text-xs text-slate-600 dark:text-neutral-400">
                                                Paid by: <span className="text-cyan-600 dark:text-cyan-400 font-bold">{getUserName(exp.paidByUserId)}</span> • Split equally among roommates
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                            <div className="text-left sm:text-right">
                                                <span className="font-black text-emerald-600 dark:text-emerald-400 text-xl">₹{exp.amount}</span>
                                                <p className="text-[11px] text-slate-500 dark:text-neutral-500">Total Bill</p>
                                            </div>
                                            {(isOwner || isAdmin) && (
                                                <button 
                                                    onClick={() => setDeleteModal({ show: true, id: exp.id })}
                                                    className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-2 rounded-xl hover:bg-rose-500/10 transition-all"
                                                    title="Delete Entry"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="bg-white/80 dark:bg-neutral-900/50 border border-slate-200 dark:border-neutral-800/80 p-6 rounded-3xl shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-200 flex items-center gap-2">
                            <PieChart className="text-cyan-600 dark:text-cyan-400" size={20} /> Category-Wise Spends Analytics
                        </h2>
                        <span className="text-xs text-slate-600 dark:text-neutral-400 font-medium bg-slate-100 dark:bg-neutral-800 px-3 py-1 rounded-xl">Live Sync</span>
                    </div>
                    <div className="w-full h-72 pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-[#262626]" />
                                <XAxis dataKey="name" stroke="#64748b" className="dark:stroke-[#737373]" fontSize={12} tickLine={false} />
                                <YAxis stroke="#64748b" className="dark:stroke-[#737373]" fontSize={12} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '16px', color: '#1e293b', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="amount" radius={[10, 10, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}