import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { DollarSign, Receipt, PieChart } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function Expenses() {
    const { user } = useAuth();
    const [pendingSplits, setPendingSplits] = useState([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('Groceries');

    const [chartData, setChartData] = useState([
        { name: 'Groceries', amount: 1200 },
        { name: 'Electricity', amount: 850 },
        { name: 'Internet', amount: 600 },
        { name: 'Rent', amount: 5000 },
        { name: 'Others', amount: 400 },
    ]);

    useEffect(() => {
        fetchPendingSplits();
    }, [user]);

    const fetchPendingSplits = () => {
        if (user) {
            api.get(`/expenses/pending/${user.id}`)
                .then(res => setPendingSplits(res.data))
                .catch(err => console.error(err));
        }
    };

    const addExpense = async (e) => {
        e.preventDefault();
        try {
            api.post('/expenses/add', {
                description,
                amount: parseFloat(amount),
                category,
                paidByUserId: user.id
            }).then(() => {
                setChartData(prev => 
                    prev.map(item => 
                        item.name === category ? { ...item, amount: item.amount + parseFloat(amount) } : item
                    )
                );
                setDescription('');
                setAmount('');
                fetchPendingSplits();
                alert('Expense added & split successfully!');
            });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="p-8 max-w-6xl mx-auto space-y-8 bg-neutral-950 min-h-screen text-neutral-100"
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl flex items-center justify-center">
                    <DollarSign size={22} />
                </div>
                <h1 className="text-3xl font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                    Expenses & Split Dues
                </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add Expense Form */}
                <div className="bg-black/40 border border-neutral-800/80 p-6 rounded-3xl shadow-xl backdrop-blur-xl">
                    <h2 className="text-lg font-bold text-neutral-200 mb-4 flex items-center gap-2">
                        <Receipt className="text-amber-400" size={20} /> Add New Expense
                    </h2>
                    <form onSubmit={addExpense} className="space-y-4">
                        <input 
                            type="text" 
                            placeholder="Description (e.g., Weekly Vegetables)" 
                            className="w-full px-4 py-3 bg-neutral-900/80 border border-neutral-800 text-neutral-200 placeholder-neutral-500 rounded-2xl focus:outline-none focus:border-amber-500 text-sm transition-all" 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            required 
                        />
                        <input 
                            type="number" 
                            placeholder="Total Amount (₹)" 
                            className="w-full px-4 py-3 bg-neutral-900/80 border border-neutral-800 text-neutral-200 placeholder-neutral-500 rounded-2xl focus:outline-none focus:border-amber-500 text-sm transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)} 
                            required 
                        />
                        <select
                            className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-2xl focus:outline-none focus:border-amber-500 text-sm"
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                        >
                            <option value="Groceries" className="bg-neutral-900">Groceries</option>
                            <option value="Electricity" className="bg-neutral-900">Electricity</option>
                            <option value="Internet" className="bg-neutral-900">Internet</option>
                            <option value="Rent" className="bg-neutral-900">Rent</option>
                            <option value="Others" className="bg-neutral-900">Others</option>
                        </select>
                        <motion.button 
                            whileTap={{ scale: 0.97 }} 
                            type="submit" 
                            className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white py-3 rounded-2xl font-bold shadow-[0_0_20px_rgba(245,158,11,0.2)] transition-all duration-300 text-sm"
                        >
                            Add & Split Bill
                        </motion.button>
                    </form>
                </div>

                {/* Pending Dues List */}
                <div className="bg-black/40 border border-neutral-800/80 p-6 rounded-3xl shadow-xl space-y-4 backdrop-blur-xl">
                    <h2 className="text-lg font-bold text-neutral-200">Your Pending Dues</h2>
                    {pendingSplits.length === 0 ? (
                        <p className="text-neutral-500 text-sm py-12 text-center">No pending dues! All settled. 🎉</p>
                    ) : (
                        <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                            {pendingSplits.map(split => (
                                <div key={split.id} className="p-4 border border-neutral-800 rounded-2xl flex justify-between items-center bg-neutral-900/60">
                                    <span className="text-sm font-medium text-neutral-300">Expense ID: #{split.expenseId}</span>
                                    <span className="font-extrabold text-rose-400 text-base">₹{split.amountOwed}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Expense Breakdown Analytics Chart */}
            <div className="bg-black/40 border border-neutral-800/80 p-6 rounded-3xl shadow-xl backdrop-blur-xl">
                <h2 className="text-lg font-bold text-neutral-200 mb-4 flex items-center gap-2">
                    <PieChart className="text-cyan-400" size={20} /> Category-Wise Expense Analytics
                </h2>
                <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262626" />
                            <XAxis dataKey="name" stroke="#737373" fontSize={12} />
                            <YAxis stroke="#737373" fontSize={12} />
                            <Tooltip contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '12px', color: '#f5f5f5' }} />
                            <Bar dataKey="amount" fill="#06b6d4" radius={[8, 8, 0, 0]} activeBar={{ fill: '#06b6d4' }} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
}