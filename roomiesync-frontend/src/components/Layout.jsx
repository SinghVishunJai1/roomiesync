import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const { user } = useAuth();

    return (
        <div className="flex bg-neutral-950 min-h-screen">
            {/* Sidebar */}
            {user && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Top Bar with Hamburger Menu */}
                {user && (
                    <div className="md:hidden flex items-center justify-between p-4 bg-black/60 border-b border-neutral-800/80 backdrop-blur-xl sticky top-0 z-30">
                        <h1 className="text-base font-black bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                            RoomieSync 🏡
                        </h1>
                        <button 
                            onClick={() => setSidebarOpen(true)}
                            className="p-2.5 bg-neutral-900 border border-neutral-800 text-neutral-200 rounded-xl hover:bg-neutral-800 transition"
                        >
                            <Menu size={20} />
                        </button>
                    </div>
                )}

                {/* Main Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}