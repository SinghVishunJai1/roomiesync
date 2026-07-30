import { motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 bg-white/90 dark:bg-neutral-900/90 border border-slate-200 dark:border-neutral-800 text-slate-800 dark:text-neutral-100 rounded-2xl shadow-xl backdrop-blur-xl"
        >
            {type === 'success' ? (
                <div className="w-8 h-8 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle2 size={18} />
                </div>
            ) : (
                <div className="w-8 h-8 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircle size={18} />
                </div>
            )}
            <div className="text-sm font-semibold">{message}</div>
            <button 
                onClick={onClose}
                className="ml-4 text-slate-400 hover:text-slate-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
}