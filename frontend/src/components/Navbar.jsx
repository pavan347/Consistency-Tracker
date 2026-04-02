import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const Navbar = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const linkClass = ({ isActive }) =>
        `px-4 py-2 text-sm font-bold uppercase tracking-wide transition-all border-3 border-[var(--color-border)] rounded-[var(--radius-brutal)] ${isActive
            ? 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-brutal-sm)]'
            : 'bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-bg-dark)]'
        }`;

    return (
        <nav className="sticky top-0 z-50 bg-[var(--color-bg)] border-b-3 border-[var(--color-border)]">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => navigate('/dashboard')}
                >
                    <span className="text-2xl">🔥</span>
                    <h1 className="text-lg font-bold tracking-tight">
                        CONSISTENCY<span className="text-[var(--color-primary)]">.</span>TRACKER
                    </h1>
                </div>

                {/* Nav Links */}
                <div className="hidden md:flex items-center gap-2">
                    <NavLink to="/dashboard" className={linkClass}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/habits" className={linkClass}>
                        Habits
                    </NavLink>
                    <NavLink to="/analytics" className={linkClass}>
                        Analytics
                    </NavLink>
                </div>

                {/* User & Logout */}
                <div className="flex items-center gap-3">
                    <span className="hidden sm:block text-xs font-mono text-[var(--color-text-muted)] bg-[var(--color-bg-dark)] px-3 py-1.5 border-2 border-[var(--color-border)] rounded-md">
                        {user?.email}
                    </span>
                    <button
                        onClick={handleLogout}
                        className="btn-brutal bg-[var(--color-danger)] text-white px-4 py-2 text-xs"
                    >
                        LOGOUT
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            <div className="md:hidden flex items-center gap-2 px-4 pb-3 overflow-x-auto">
                <NavLink to="/dashboard" className={linkClass}>
                    Dashboard
                </NavLink>
                <NavLink to="/habits" className={linkClass}>
                    Habits
                </NavLink>
                <NavLink to="/analytics" className={linkClass}>
                    Analytics
                </NavLink>
            </div>
        </nav>
    );
};

export default Navbar;
