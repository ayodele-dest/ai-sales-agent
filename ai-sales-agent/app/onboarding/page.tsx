'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Check, Target, Rocket, SlidersHorizontal, ArrowRight, Loader2 } from 'lucide-react';
import { BusinessTypeSelect } from '@/components/ui/BusinessTypeSelect';
import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete';
import type { Targeting } from '@/types';

type Step = 1 | 2 | 3;

interface OnboardingData {
    industry: string;
    location: string;
    dealValue: string;
    strategyOutcome: string;
    strategyCredibility: string;
    strategyDifference: string;
    strategyCta: string;
}

const DEFAULT_TARGETING: Targeting = {
    businessSize: 'any',
    companyAge: 'any',
    revenueRange: 'any',
    decisionMakerTitle: 'any',
    hasWebsite: 'any',
    operatingHours: 'any',
};

const DEFAULT_TEMPLATE_SUBJECT = `Quick question about {{companyName}}'s growth`;
const DEFAULT_TEMPLATE_BODY = `Hi {{contactName}},

I noticed {{companyName}} is doing exciting work in the {{industry}} space in {{location}}.

I help companies like yours [YOUR VALUE PROPOSITION]. I'd love to share how we recently helped a similar business [RESULT].

Would you be open to a quick 10-minute chat this week?

Best,
[YOUR NAME]`;

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState<OnboardingData>({
        industry: '',
        location: '',
        dealValue: '',
        strategyOutcome: '',
        strategyCredibility: '',
        strategyDifference: '',
        strategyCta: '',
    });

    const update = (field: keyof OnboardingData, value: string) =>
        setData(prev => ({ ...prev, [field]: value }));

    const canProceed = () => {
        if (step === 1) return data.industry && data.location;
        if (step === 2) return data.strategyOutcome; // Require at least one strategy field
        return true;
    };

    const handleLaunch = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'My First Campaign',
                    industry: data.industry,
                    location: data.location,
                    dealValue: data.dealValue,
                    targeting: DEFAULT_TARGETING,
                    emailTemplate: { subject: DEFAULT_TEMPLATE_SUBJECT, body: DEFAULT_TEMPLATE_BODY },
                }),
            });
            const json = await res.json();
            if (!res.ok) { setError(json.error || 'Failed to create campaign'); setLoading(false); return; }
            router.push(`/dashboard?campaignId=${json.campaign.id}&industry=${encodeURIComponent(data.industry)}&location=${encodeURIComponent(data.location)}&dealValue=${encodeURIComponent(data.dealValue)}`);
        } catch {
            setError('Something went wrong.');
            setLoading(false);
        }
    };

    const steps = [
        { num: 1, label: 'Audience', icon: Target },
        { num: 2, label: 'Offer', icon: SlidersHorizontal },
        { num: 3, label: 'Launch', icon: Rocket },
    ];



    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center pt-20 px-4 md:px-8">
            <div className="max-w-2xl w-full">

                <div className="text-center mb-12">
                    <div className="inline-flex p-3 bg-indigo-600/10 rounded-2xl mb-6 ring-1 ring-indigo-500/20">
                        <Bot className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-bold mb-3 tracking-tight">Let's set up your first campaign</h1>
                    <p className="text-gray-400 text-lg">We just need a few details to get the AI working for you.</p>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center justify-center gap-3 mb-10 overflow-x-auto pb-2">
                    {steps.map((s, i) => (
                        <div key={s.num} className="flex items-center gap-3 shrink-0">
                            <div className={`flex items-center gap-2.5 ${step === s.num ? 'text-white' : step > s.num ? 'text-indigo-400' : 'text-gray-600'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all text-sm font-bold ${step > s.num ? 'bg-indigo-600 border-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]' :
                                    step === s.num ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_10px_rgba(79,70,229,0.2)]' :
                                        'border-gray-800 bg-gray-900'
                                    }`}>
                                    {step > s.num ? <Check className="w-4 h-4 text-white" /> : s.num}
                                </div>
                                <span className="text-sm font-medium hidden sm:block">{s.label}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`h-px w-10 sm:w-16 transition-all ${step > s.num ? 'bg-indigo-600' : 'bg-gray-800'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-50" />

                    <AnimatePresence mode="wait">

                        {/* STEP 1 — Audience */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Who do you want more clients from?</h2>
                                    <p className="text-gray-400 text-sm">Tell the AI who you want to reach.</p>
                                </div>

                                <FormField label="Target Industry / Business Type">
                                    <BusinessTypeSelect value={data.industry} onChange={v => update('industry', v)} />
                                </FormField>
                                <FormField label="Target Location">
                                    <LocationAutocomplete value={data.location} onChange={v => update('location', v)} />
                                </FormField>
                            </motion.div>
                        )}

                        {/* STEP 2 — Offer */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">What do you offer them?</h2>
                                    <p className="text-gray-400 text-sm">Help the AI craft the perfect angle.</p>
                                </div>

                                <FormField label="What is the main outcome you provide?">
                                    <input value={data.strategyOutcome} onChange={e => update('strategyOutcome', e.target.value)} placeholder="e.g. Decrease client churn by 20% in 3 months" className={inputCls} />
                                </FormField>

                                <FormField label="Why should they trust you? (Credibility)">
                                    <input value={data.strategyCredibility} onChange={e => update('strategyCredibility', e.target.value)} placeholder="e.g. Worked with 50+ SaaS companies including Stripe" className={inputCls} />
                                </FormField>
                            </motion.div>
                        )}

                        {/* STEP 3 — Launch */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="space-y-6 text-center py-6">
                                <div className="mx-auto w-16 h-16 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center mb-6">
                                    <Rocket className="w-8 h-8 text-indigo-400" />
                                </div>
                                <h2 className="text-3xl font-bold mb-3">Launch a 5-lead test campaign</h2>
                                <p className="text-gray-400 text-base max-w-md mx-auto mb-8">
                                    We'll find 5 verified contacts matching your criteria and send them your personalized offer.
                                </p>

                                <div className="text-left space-y-4 max-w-sm mx-auto mb-8">
                                    <FormField label="What is your average deal value? (Optional)">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">$</span>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                value={data.dealValue}
                                                onChange={e => update('dealValue', e.target.value)}
                                                placeholder="e.g. 5000"
                                                className={`${inputCls} pl-8`}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1.5">For estimating your pipeline value on the dashboard.</p>
                                    </FormField>
                                </div>
                            </motion.div>
                        )}

                    </AnimatePresence>

                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mt-6">
                            {error}
                        </motion.div>
                    )}

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-10 pt-6 border-t border-white/5">
                        <button
                            onClick={() => {
                                if (step === 1) router.back();
                                else setStep(s => s - 1 as Step);
                            }}
                            className="text-gray-400 hover:text-white px-4 py-2 font-medium transition-colors"
                        >
                            {step === 1 ? 'Cancel' : 'Back'}
                        </button>

                        <button
                            onClick={() => {
                                if (step < 3) setStep(s => s + 1 as Step);
                                else handleLaunch();
                            }}
                            disabled={!canProceed() || loading}
                            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl font-semibold transition-all hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Launching...</>
                            ) : step === 3 ? (
                                <><Rocket className="w-4 h-4" /> Start Auto-Pilot</>
                            ) : (
                                <>Continue <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-gray-600";

function FormField({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">{label}</label>
            {children}
        </div>
    );
}
