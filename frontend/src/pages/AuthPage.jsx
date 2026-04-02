import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { login, register, isLoading } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please fill in all fields');
            return;
        }

        if (!isLogin && password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        const result = isLogin
            ? await login(email, password)
            : await register(email, password);

        if (result.success) {
            toast.success(isLogin ? 'Welcome back!' : 'Account created!');
            navigate('/dashboard');
        } else {
            toast.error(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
            <div className="w-full max-w-md animate-slide-up">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">🔥</div>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">
                        CONSISTENCY<span className="text-[var(--color-primary)]">.</span>TRACKER
                    </h1>
                    <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-text-muted)]">
                        Discipline Over Motivation
                    </p>
                </div>

                {/* Auth Card */}
                <Card className="bg-[var(--color-surface)]">
                    {/* Toggle */}
                    <div className="flex mb-6 border-3 border-[var(--color-border)] rounded-[var(--radius-brutal)] overflow-hidden">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${isLogin
                                    ? 'bg-[var(--color-primary)] text-white'
                                    : 'bg-[var(--color-surface)] text-[var(--color-text)]'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-3 text-sm font-bold uppercase tracking-wide transition-colors border-l-3 border-[var(--color-border)] ${!isLogin
                                    ? 'bg-[var(--color-secondary)] text-[var(--color-text)]'
                                    : 'bg-[var(--color-surface)] text-[var(--color-text)]'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your@email.com"
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 characters"
                        />
                        {!isLogin && (
                            <Input
                                label="Confirm Password"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat password"
                            />
                        )}
                        <Button
                            type="submit"
                            variant={isLogin ? 'primary' : 'secondary'}
                            size="lg"
                            disabled={isLoading}
                            className="w-full mt-2"
                        >
                            {isLoading ? 'Loading...' : isLogin ? '→ Login' : '→ Create Account'}
                        </Button>
                    </form>
                </Card>

                {/* Footer */}
                <div className="mt-6 text-center">
                    <p className="text-xs font-mono text-[var(--color-text-muted)]">
                        No excuses. No shortcuts. Just consistency.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
