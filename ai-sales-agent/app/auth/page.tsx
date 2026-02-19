'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Eye, EyeOff, Loader2, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthPage() {
    const router = useRouter();
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (mode === 'signup') {
                const res = await fetch('/api/auth/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password }),
                });
                const data = await res.json();
                if (!res.ok) { setError(data.error || 'Sign up failed'); setLoading(false); return; }
            }

            const result = await signIn('credentials', {
                email, password, redirect: false,
            });

            if (result?.error) {
                setError('Invalid email or password');
                setLoading(false);
            } else {
                router.push('/campaigns');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-700/20 rounded-full blur-3xl animate-pulse delay-700" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Logo */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 rounded-xl">
                            <Bot className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-white">SalesAgent AI</span>
                    </div>
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                    {/* Tab switcher */}
                    <div className="flex bg-white/5 rounded-xl p-1 mb-6 border border-white/10">
                        {(['signin', 'signup'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => { setMode(m); setError(''); }}
                                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === m ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {m === 'signin' ? 'Sign In' : 'Create Account'}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {mode === 'signup' && (
                                <motion.div
                                    key="name"
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                >
                                    <InputField label="Full Name" type="text" value={name} onChange={setName} placeholder="John Smith" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@company.com" />

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all pr-12"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
                                {error}
                            </motion.p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                            {mode === 'signin' ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    {mode === 'signin' && (
                        <p className="text-center text-xs text-gray-600 mt-4">
                            Don't have an account?{' '}
                            <button onClick={() => setMode('signup')} className="text-indigo-400 hover:underline">
                                Sign up free
                            </button>
                        </p>
                    )}
                </div>

                <p className="text-center text-xs text-gray-700 mt-6">
                    By continuing, you agree to our Terms of Service.
                </p>
            </motion.div>
        </div>
    );
}

function InputField({ label, type, value, onChange, placeholder }: {
    label: string; type: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
            <input
                type={type}
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            />
        </div>
    );
}
