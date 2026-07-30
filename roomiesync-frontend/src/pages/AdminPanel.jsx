import { useState, useEffect } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Toast from "../components/Toast";
import {
    UserPlus,
    ClipboardList,
    ShieldAlert,
    Trash2,
    Users,
    AlertTriangle,
    Wallet,
    Check,
} from "lucide-react";

export default function AdminPanel() {
    const { user } = useAuth();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [taskTitle, setTaskTitle] = useState("");
    const [assignedUserId, setAssignedUserId] = useState("");

    const [usersList, setUsersList] = useState([]);
    const [pendingSettlements, setPendingSettlements] = useState([]);

    const [toastMessage, setToastMessage] = useState(null);
    const [toastType, setToastType] = useState("success");

    const [userToDelete, setUserToDelete] = useState(null);

    const showToast = (message, type = "success") => {
        setToastMessage(message);
        setToastType(type);
        setTimeout(() => {
            setToastMessage(null);
        }, 3000);
    };

    useEffect(() => {
        if (user?.role === "ADMIN") {
            fetchUsers();
            fetchPendingSettlements();
        }
    }, [user]);

    const fetchUsers = () => {
        api.get("/users/all")
            .then((res) => setUsersList(res.data))
            .catch((err) => console.error("Error fetching users:", err));
    };

    const fetchPendingSettlements = () => {
        api.get("/expenses/settlements/pending")
            .then((res) => setPendingSettlements(res.data))
            .catch((err) => {
                console.error("Error fetching pending settlements:", err);
                setPendingSettlements([]);
            });
    };

    const handleVerifySettlement = async (settlementId) => {
        try {
            await api.put(`/expenses/settlements/verify/${settlementId}`);
            showToast("Settlement verified & dues cleared successfully! ✅", "success");
            setPendingSettlements((prev) => prev.filter((s) => s.id !== settlementId));
        } catch (err) {
            console.error("Failed to verify settlement:", err);
            showToast("Failed to verify settlement payment", "error");
        }
    };

    if (user?.role !== "ADMIN") {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-neutral-950 p-8 text-slate-800 dark:text-neutral-100">
                <div className="bg-white dark:bg-black/40 border border-slate-200 dark:border-neutral-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-xl text-center space-y-3 max-w-md w-full">
                    <div className="w-12 h-12 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-2xl mx-auto flex items-center justify-center">
                        <ShieldAlert size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-neutral-200">Access Denied!</h2>
                    <p className="text-sm text-slate-600 dark:text-neutral-400">
                        Only Admin can view this page.
                    </p>
                </div>
            </div>
        );
    }

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await api.post("/users/register", {
                name,
                email,
                password,
                role: "USER",
            });
            showToast("Flatmate account created successfully!", "success");
            setName("");
            setEmail("");
            setPassword("");
            fetchUsers();
        } catch (err) {
            console.error(err);
            showToast("Failed to create user", "error");
        }
    };

    const handleAssignTask = async (e) => {
        e.preventDefault();
        try {
            await api.post("/tasks/assign", {
                title: taskTitle,
                assignedToUserId: parseInt(assignedUserId),
            });
            showToast("Task assigned successfully!", "success");
            setTaskTitle("");
            setAssignedUserId("");
        } catch (err) {
            console.error(err);
            showToast("Failed to assign task", "error");
        }
    };

    const confirmDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await api.delete(`/users/delete/${userToDelete.id}`);
            showToast("User deleted successfully!", "success");
            setUserToDelete(null);
            fetchUsers();
        } catch (err) {
            console.error(err);
            showToast("Failed to delete user", "error");
            setUserToDelete(null);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
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

            <AnimatePresence>
                {userToDelete && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 rounded-3xl shadow-2xl max-w-md w-full space-y-4"
                        >
                            <div className="w-12 h-12 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-2xl flex items-center justify-center mx-auto">
                                <AlertTriangle size={24} />
                            </div>
                            <div className="text-center space-y-1">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100">
                                    Delete Flatmate?
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-neutral-400">
                                    Are you sure you want to remove{" "}
                                    <span className="text-slate-900 dark:text-neutral-200 font-semibold">
                                        {userToDelete.name}
                                    </span>
                                    ? This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setUserToDelete(null)}
                                    className="flex-1 py-3 bg-slate-200 dark:bg-neutral-800 hover:bg-slate-300 dark:hover:bg-neutral-700 text-slate-700 dark:text-neutral-300 rounded-2xl text-xs font-bold transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteUser}
                                    className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold shadow-md transition"
                                >
                                    Yes, Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <h1 className="text-3xl font-black bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Admin Control Center 👑
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-neutral-800/80 p-6 rounded-3xl shadow-xl backdrop-blur-xl">
                    <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-neutral-200 flex items-center gap-2">
                        <UserPlus className="text-cyan-600 dark:text-cyan-400" size={20} /> Create User Account
                    </h2>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-500 rounded-2xl focus:outline-none focus:border-cyan-500 text-sm transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-500 rounded-2xl focus:outline-none focus:border-cyan-500 text-sm transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-500 rounded-2xl focus:outline-none focus:border-cyan-500 text-sm transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            type="submit"
                            className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white py-3 rounded-2xl font-bold text-sm shadow-md transition-all duration-300"
                        >
                            Create Flatmate
                        </motion.button>
                    </form>
                </div>

                <div className="bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-neutral-800/80 p-6 rounded-3xl shadow-xl backdrop-blur-xl flex flex-col justify-between">
                    <h2 className="text-lg font-bold mb-4 text-slate-900 dark:text-neutral-200 flex items-center gap-2">
                        <ClipboardList className="text-violet-600 dark:text-violet-400" size={20} /> Assign Task
                    </h2>
                    <form onSubmit={handleAssignTask} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Task Title (e.g. Clean Kitchen)"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-500 rounded-2xl focus:outline-none focus:border-violet-500 text-sm transition-all"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            required
                        />
                        <input
                            type="number"
                            placeholder="Roommate User ID"
                            className="w-full px-4 py-3 bg-slate-50 dark:bg-neutral-900/80 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-200 placeholder-slate-400 dark:placeholder-neutral-500 rounded-2xl focus:outline-none focus:border-violet-500 text-sm transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            value={assignedUserId}
                            onChange={(e) => setAssignedUserId(e.target.value)}
                            required
                        />
                        <div className="pt-2">
                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                type="submit"
                                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white py-3 rounded-2xl font-bold text-sm shadow-md transition-all duration-300"
                            >
                                Assign Task
                            </motion.button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-neutral-800/80 p-6 rounded-3xl shadow-xl backdrop-blur-xl space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-200 flex items-center gap-2">
                    <Wallet className="text-emerald-600 dark:text-emerald-400" size={20} /> Settlement Payment Approvals
                </h2>
                {pendingSettlements.length === 0 ? (
                    <p className="text-slate-500 dark:text-neutral-500 text-sm py-6 text-center">
                        No pending payment verifications right now.
                    </p>
                ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {pendingSettlements.map((item) => (
                            <div
                                key={item.id}
                                className="p-4 border border-slate-200 dark:border-neutral-800 rounded-2xl flex justify-between items-center bg-slate-50 dark:bg-neutral-900/60"
                            >
                                <div>
                                    <p className="font-bold text-slate-900 dark:text-neutral-200 text-sm">
                                        {item.payerName || `Roommate #${item.payerUserId}`}
                                    </p>
                                    <p className="text-xs text-slate-600 dark:text-neutral-400">
                                        Paid ₹<span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.amount}</span> to Admin for Bill #{item.expenseId}
                                    </p>
                                </div>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleVerifySettlement(item.id)}
                                    className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-500 hover:text-white transition flex items-center gap-1.5 shadow-sm"
                                >
                                    <Check size={14} /> Verify & Clear Dues
                                </motion.button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-white/80 dark:bg-black/40 border border-slate-200 dark:border-neutral-800/80 p-6 rounded-3xl shadow-xl backdrop-blur-xl space-y-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-neutral-200 flex items-center gap-2">
                    <Users className="text-rose-600 dark:text-rose-400" size={20} /> Manage Flatmates (Delete Users)
                </h2>
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {usersList.map((u) => (
                        <div
                            key={u.id}
                            className="p-4 border border-slate-200 dark:border-neutral-800 rounded-2xl flex justify-between items-center bg-slate-50 dark:bg-neutral-900/60"
                        >
                            <div>
                                <p className="font-bold text-slate-900 dark:text-neutral-200 text-sm flex items-center gap-2">
                                    {u.name}{" "}
                                    <span className="text-[10px] text-slate-400 dark:text-neutral-500 font-mono">
                                        ID: #{u.id}
                                    </span>
                                </p>
                                <p className="text-xs text-slate-600 dark:text-neutral-400">{u.email}</p>
                            </div>
                            {u.role !== "ADMIN" && (
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setUserToDelete(u)}
                                    className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 px-3 py-2 rounded-xl text-xs font-bold hover:bg-rose-500/20 transition flex items-center gap-1.5 shadow-sm"
                                >
                                    <Trash2 size={14} /> Delete
                                </motion.button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}