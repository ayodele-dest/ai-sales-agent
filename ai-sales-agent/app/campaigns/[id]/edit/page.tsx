'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Bot, Check, Loader2, Target, Mail, Rocket, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { BusinessTypeSelect } from '@/components/ui/BusinessTypeSelect';
import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete';

type Step = 1 | 2 | 3;

interface FormData {
    name: string;
    industry: string;
    location: string;
    subject: string;
    body: string;
}

export default function EditCampaignPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState('');
    const [saved, setSaved] = useState(false);
    const [data, setData] = useState<FormData>({
        name: '', industry: '', location: '', subject: '', body: '',
    });

    // Load existing campaign data
    useEffect(() => {
        fetch(`/api/campaigns/${id}`)
            .then(r => r.json())
            .then(json => {
                if (json.campaign) {
                    const c = json.campaign;
                    setData({
                        name: c.name,
                        industry: c.industry,
                        location: c.location,
                        subject: c.emailTemplate?.subject ?? '',
                        body: c.emailTemplate?.body ?? '',
                    });
                } else {
                    setError('Campaign not found.');
                }
            })
            .catch(() => setError('Failed to load campaign.'))
            .finally(() => setFetching(false));
    }, [id]);

    const update = (field: keyof FormData, value: string) =>
        setData(prev => ({ ...prev, [field]: value }));

    const canProceed = () => {
        if (step === 1) return data.name && data.industry && data.location;
        if (step === 2) return data.subject && data.body;
        return true;
    };

    const handleSave = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/campaigns/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    industry: data.industry,
                    location: data.location,
                    emailTemplate: { subject: data.subject, body: data.body },
                }),
            });
            const json = await res.json();
            if (!res.ok) { setError(json.error || 'Save failed'); setLoading(false); return; }
            setSaved(true);
            setTimeout(() => router.push('/campaigns'), 1200);
        } catch {
            setError('Something went wrong.');
            setLoading(false);
        }
    };

    const steps = [
        { num: 1, label: 'Target', icon: Target },
        { num: 2, label: 'Email', icon: Mail },
        { num: 3, label: 'Review', icon: Rocket },
    ];

    const inputCls = "w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all";

    if (fetching) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/campaigns">
                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-amber-500/20 rounded-lg"><Bot className="w-5 h-5 text-amber-400" /></div>
                        <div>
                            <span className="font-bold text-lg">Edit Campaign</span>
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Edit Mode
                            </span>
                        </div>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-4 mb-10">
                    {steps.map((s, i) => (
                        <div key={s.num} className="flex items-center gap-4">
                            <div className={`flex items-center gap-2.5 ${step === s.num ? 'text-white' : step > s.num ? 'text-amber-400' : 'text-gray-600'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all text-sm font-bold ${step > s.num ? 'bg-amber-500 border-amber-500' :
                                        step === s.num ? 'border-amber-500 bg-amber-500/10' :
                                            'border-gray-800 bg-gray-900'
                                    }`}>
                                    {step > s.num ? <Check className="w-4 h-4 text-white" /> : s.num}
                                </div>
                                <span className="text-sm font-medium hidden sm:block">{s.label}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`flex-1 h-px w-16 transition-all ${step > s.num ? 'bg-amber-500' : 'bg-gray-800'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold mb-1">Edit target market</h2>
                                    <p className="text-gray-500 text-sm">Update who you want to reach with this campaign.</p>
                                </div>

                                <FormField label="Campaign Name">
                                    <input value={data.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Q1 Coffee Shop Outreach" className={inputCls} />
                                </FormField>

                                <FormField label="Target Industry / Business Type">
                                    <BusinessTypeSelect value={data.industry} onChange={v => update('industry', v)} />
                                </FormField>

                                <FormField label="Target Location">
                                    <LocationAutocomplete value={data.location} onChange={v => update('location', v)} />
                                </FormField>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold mb-1">Edit email template</h2>
                                    <p className="text-gray-500 text-sm">Changes apply to future runs of this campaign.</p>
                                </div>

                                <div className="flex flex-wrap gap-2 p-3 bg-black/30 rounded-xl border border-white/5">
                                    <span className="text-xs text-gray-500 w-full mb-1 font-medium">Click a placeholder to insert at end:</span>
                                    {['{{companyName}}', '{{contactName}}', '{{industry}}', '{{location}}'].map(p => (
                                        <span key={p} className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 rounded text-xs font-mono cursor-pointer hover:bg-indigo-500/20"
                                            onClick={() => update('body', data.body + p)}>
                                            {p}
                                        </span>
                                    ))}
                                </div>

                                <FormField label="Subject Line">
                                    <input value={data.subject} onChange={e => update('subject', e.target.value)} className={inputCls} />
                                </FormField>

                                <FormField label="Email Body">
                                    <textarea value={data.body} onChange={e => update('body', e.target.value)} rows={10} className={`${inputCls} resize-none font-mono text-sm leading-relaxed`} />
                                </FormField>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold mb-1">Review changes</h2>
                                    <p className="text-gray-500 text-sm">Save your edits — the campaign will use these settings on the next run.</p>
                                </div>

                                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
                                    <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                                    <p className="text-xs text-amber-300">Changes take effect on the next campaign run. Past emails are not affected.</p>
                                </div>

                                <div className="space-y-1">
                                    <ReviewRow label="Campaign Name" value={data.name} />
                                    <ReviewRow label="Industry" value={data.industry} />
                                    <ReviewRow label="Location" value={data.location} />
                                    <ReviewRow label="Email Subject" value={data.subject} />
                                </div>

                                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                    <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Email Preview</p>
                                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                                        {data.body
                                            .replace(/{{companyName}}/g, 'Acme Corp')
                                            .replace(/{{contactName}}/g, 'Sarah')
                                            .replace(/{{industry}}/g, data.industry)
                                            .replace(/{{location}}/g, data.location)}
                                    </pre>
                                </div>

                                {error && (
                                    <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">{error}</p>
                                )}

                                {saved ? (
                                    <div className="w-full bg-emerald-500/10 border border-emerald-500/20 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 text-emerald-400">
                                        <Check className="w-5 h-5" /> Saved! Redirecting...
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleSave}
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-60 text-black"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                {step < 3 && (
                    <div className="flex justify-between mt-6">
                        <button
                            onClick={() => setStep(prev => (prev - 1) as Step)}
                            disabled={step === 1}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                        <button
                            onClick={() => setStep(prev => (prev + 1) as Step)}
                            disabled={!canProceed()}
                            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        >
                            Continue <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
            {children}
        </div>
    );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-start gap-4 py-3 border-b border-white/5 last:border-0">
            <span className="text-sm text-gray-500 shrink-0">{label}</span>
            <span className="text-sm text-white text-right">{value}</span>
        </div>
    );
}
