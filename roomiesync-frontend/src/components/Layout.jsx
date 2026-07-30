import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();

    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="flex bg-slate-50 dark:bg-neutral-950 min-h-screen text-slate-800 dark:text-neutral-100 transition-colors duration-300">
            {/* Sidebar */}
            {user && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

            <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-neutral-950 transition-colors duration-300">
                {/* Mobile Top Bar with Hamburger Menu & User Badge */}
                {user && (
                    <div className="md:hidden flex items-center justify-between px-5 py-3.5 bg-white/80 dark:bg-black/60 border-b border-slate-200 dark:border-neutral-800/80 backdrop-blur-xl sticky top-0 z-30">
                        <div className="flex items-center gap-2">
                            <h1 className="text-base font-black bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 dark:from-violet-400 dark:via-fuchsia-400 dark:to-cyan-400 bg-clip-text text-transparent">
                                RoomieSync 🏡
                            </h1>
                            {isAdmin && (
                                <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                                    <ShieldCheck size={10} /> Admin
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-500 text-white font-bold text-xs flex items-center justify-center shadow-sm uppercase">
                                {user.name?.charAt(0) || 'U'}
                            </div>

                            <motion.button 
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 bg-slate-100 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 text-slate-700 dark:text-neutral-200 rounded-xl hover:bg-slate-200 dark:hover:bg-neutral-800 transition"
                                title="Open Menu"
                            >
                                <Menu size={20} />
                            </motion.button>
                        </div>
                    </div>
                )}

                {/* Main Page Content */}
                <main className="flex-1 w-full overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}