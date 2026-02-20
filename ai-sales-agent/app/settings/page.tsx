'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import {
    Bot, ArrowLeft, LogOut, Mail, CheckCircle, AlertCircle,
    Loader2, Trash2, SendHorizonal, Settings, Wifi, WifiOff,
} from 'lucide-react';
import type { EmailProvider } from '@/lib/email-connector-store';



interface FormState {
    provider: EmailProvider;
    fromName: string;
    fromEmail: string;
    smtpPassword: string;
    // Custom SMTP only
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpSecure: boolean;
}

export default function SettingsPage() {
    const { data: session } = useSession();
    const [connected, setConnected] = useState(false);
    const [connectedEmail, setConnectedEmail] = useState('');
    const [connectedName, setConnectedName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

    const [form, setForm] = useState<FormState>({
        provider: 'gmail',
        fromName: '',
        fromEmail: '',
        smtpPassword: '',
        smtpHost: '',
        smtpPort: 587,
        smtpUser: '',
        smtpSecure: false,
    });

    const update = (field: keyof FormState, value: string | number | boolean) =>
        setForm(prev => ({ ...prev, [field]: value }));

    useEffect(() => {
        fetch('/api/settings/email')
            .then(r => r.json())
            .then(d => {
                if (d.connection) {
                    setConnected(true);
                    setConnectedEmail(d.connection.fromEmail);
                    setConnectedName(d.connection.fromName);
                    setForm(prev => ({
                        ...prev,
                        provider: d.connection.provider,
                        fromName: d.connection.fromName,
                        fromEmail: d.connection.fromEmail,
                        smtpHost: d.connection.smtpHost,
                        smtpPort: d.connection.smtpPort,
                        smtpUser: d.connection.smtpUser,
                        smtpSecure: d.connection.smtpSecure,
                    }));
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');
        try {
            const res = await fetch('/api/settings/email', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            if (!res.ok) { setError(json.error || 'Save failed'); return; }
            setConnected(true);
            setConnectedEmail(json.connection.fromEmail);
            setConnectedName(json.connection.fromName);
            setSuccess('Email account connected successfully!');
        } catch { setError('Something went wrong.'); }
        finally { setSaving(false); }
    };

    const handleTest = async () => {
        setTesting(true);
        setTestResult(null);
        try {
            const res = await fetch('/api/settings/email/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const json = await res.json();
            setTestResult({ ok: res.ok, message: json.message || json.error || 'Unknown result' });
        } catch { setTestResult({ ok: false, message: 'Request failed.' }); }
        finally { setTesting(false); }
    };

    const handleDisconnect = async () => {
        await fetch('/api/settings/email', { method: 'DELETE' });
        setConnected(false);
        setConnectedEmail('');
        setConnectedName('');
        setSuccess('Account disconnected.');
        setForm(prev => ({ ...prev, fromName: '', fromEmail: '', smtpPassword: '' }));
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Nav */}
            <nav className="border-b border-white/5 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link href="/campaigns">
                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-600 rounded-lg"><Bot className="w-5 h-5" /></div>
                        <span className="font-bold text-lg">SalesAgent AI</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-400">
                        {session?.user?.name}
                    </span>
                    <button onClick={() => signOut({ callbackUrl: '/auth' })} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </nav>

            <div className="max-w-2xl mx-auto px-6 py-12">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                        <Settings className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Settings</h1>
                        <p className="text-sm text-gray-500">Manage your account preferences</p>
                    </div>
                </div>

                {/* Connected Status Banner */}
                {connected && !loading && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <Wifi className="w-5 h-5 text-emerald-400 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-emerald-300">Email Connected</p>
                                <p className="text-xs text-emerald-500">Sending as <strong>{connectedName}</strong> · {connectedEmail}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleDisconnect}
                            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-400/40 px-3 py-1.5 rounded-lg transition-all"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Disconnect
                        </button>
                    </div>
                )}

                {/* Email Connector Card */}
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <div className="px-6 py-5 border-b border-white/5 flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Mail className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h2 className="font-semibold">Sending Identity</h2>
                                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-medium text-gray-400">
                                    Sending via Resend (Free Plan)
                                </span>
                            </div>
                            <p className="text-xs text-gray-500">Configure how your outreach emails appear to recipients.</p>
                        </div>
                        {connected ? (
                            <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                                <CheckCircle className="w-3.5 h-3.5" /> Connected
                            </span>
                        ) : (
                            <span className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
                                <WifiOff className="w-3.5 h-3.5" /> Not connected
                            </span>
                        )}
                    </div>

                    <div className="p-6 space-y-5">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                            </div>
                        ) : (
                            <>
                                {/* From Name & Email */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="From Name">
                                        <input value={form.fromName} onChange={e => update('fromName', e.target.value)} placeholder="Your Name or Company" className={inputCls} />
                                    </Field>
                                    <Field label="From Email">
                                        <input value={form.fromEmail} onChange={e => update('fromEmail', e.target.value)} type="email" placeholder="you@example.com" className={inputCls} />
                                    </Field>
                                </div>

                                {/* Feedback */}
                                {error && <Alert type="error" message={error} />}
                                {success && <Alert type="success" message={success} />}
                                {testResult && (
                                    <Alert type={testResult.ok ? 'success' : 'error'} message={testResult.message} />
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-1">
                                    <button
                                        onClick={handleTest}
                                        disabled={testing || !form.fromEmail}
                                        className="flex items-center gap-2 px-4 py-2.5 border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white rounded-xl text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizonal className="w-4 h-4" />}
                                        {testing ? 'Testing...' : 'Send Test Email'}
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving || !form.fromName || !form.fromEmail}
                                        className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                        {saving ? 'Saving...' : connected ? 'Update Account Information' : 'Save Account Information'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

const inputCls = "w-full bg-black/30 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all";
const labelCls = "block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className={labelCls}>{label}</label>
            {children}
        </div>
    );
}

function Alert({ type, message }: { type: 'success' | 'error'; message: string }) {
    return (
        <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl border text-sm ${type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            : 'bg-red-500/10 border-red-500/20 text-red-300'
            }`}>
            {type === 'success'
                ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
                : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
            {message}
        </div>
    );
}
