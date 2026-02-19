'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, ArrowRight, Bot, Check, Loader2, Target, Mail,
    Rocket, Sparkles, SlidersHorizontal
} from 'lucide-react';
import Link from 'next/link';
import { BusinessTypeSelect } from '@/components/ui/BusinessTypeSelect';
import { LocationAutocomplete } from '@/components/ui/LocationAutocomplete';
import type {
    BusinessSize, CompanyAge, RevenueRange, DecisionMakerTitle,
    HasWebsite, OperatingHours, Targeting
} from '@/types';

type Step = 1 | 2 | 3 | 4;

interface WizardData {
    name: string;
    industry: string;
    location: string;
    targeting: Targeting;
    subject: string;
    body: string;
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

export default function NewCampaignPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState<WizardData>({
        name: '',
        industry: '',
        location: '',
        targeting: DEFAULT_TARGETING,
        subject: DEFAULT_TEMPLATE_SUBJECT,
        body: DEFAULT_TEMPLATE_BODY,
    });

    const update = (field: keyof Omit<WizardData, 'targeting'>, value: string) =>
        setData(prev => ({ ...prev, [field]: value }));

    const updateTargeting = <K extends keyof Targeting>(field: K, value: Targeting[K]) =>
        setData(prev => ({ ...prev, targeting: { ...prev.targeting, [field]: value } }));

    const canProceed = () => {
        if (step === 1) return data.name && data.industry && data.location;
        if (step === 3) return data.subject && data.body;
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
                    name: data.name,
                    industry: data.industry,
                    location: data.location,
                    targeting: data.targeting,
                    emailTemplate: { subject: data.subject, body: data.body },
                }),
            });
            const json = await res.json();
            if (!res.ok) { setError(json.error || 'Failed to create campaign'); setLoading(false); return; }
            router.push(`/dashboard?campaignId=${json.campaign.id}&industry=${encodeURIComponent(data.industry)}&location=${encodeURIComponent(data.location)}`);
        } catch {
            setError('Something went wrong.');
            setLoading(false);
        }
    };

    const steps = [
        { num: 1, label: 'Target', icon: Target },
        { num: 2, label: 'Targeting', icon: SlidersHorizontal },
        { num: 3, label: 'Email', icon: Mail },
        { num: 4, label: 'Launch', icon: Rocket },
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 md:p-8">
            <div className="max-w-3xl mx-auto mb-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/campaigns">
                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-600 rounded-lg"><Bot className="w-5 h-5" /></div>
                        <span className="font-bold text-lg">New Campaign</span>
                    </div>
                </div>

                {/* Step Indicator */}
                <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2">
                    {steps.map((s, i) => (
                        <div key={s.num} className="flex items-center gap-3 shrink-0">
                            <div className={`flex items-center gap-2.5 ${step === s.num ? 'text-white' : step > s.num ? 'text-indigo-400' : 'text-gray-600'}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all text-sm font-bold ${step > s.num ? 'bg-indigo-600 border-indigo-600' :
                                    step === s.num ? 'border-indigo-500 bg-indigo-500/10' :
                                        'border-gray-800 bg-gray-900'
                                    }`}>
                                    {step > s.num ? <Check className="w-4 h-4 text-white" /> : s.num}
                                </div>
                                <span className="text-sm font-medium hidden sm:block">{s.label}</span>
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`h-px w-10 transition-all ${step > s.num ? 'bg-indigo-600' : 'bg-gray-800'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Step Content */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl min-h-[420px]">
                    <AnimatePresence mode="wait">

                        {/* STEP 1 — Basics */}
                        {step === 1 && (
                            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold mb-1">Define your target market</h2>
                                    <p className="text-gray-500 text-sm">Tell the AI who you want to reach.</p>
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

                        {/* STEP 2 — Advanced Targeting */}
                        {step === 2 && (
                            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold mb-1">Advanced Targeting</h2>
                                    <p className="text-gray-500 text-sm">Narrow your audience for better quality leads. Leave any as "Any" to keep it broad.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <TargetingSelect
                                        label="Business Size"
                                        value={data.targeting.businessSize}
                                        onChange={v => updateTargeting('businessSize', v as BusinessSize)}
                                        options={[
                                            { value: 'any', label: 'Any size' },
                                            { value: 'solo', label: 'Solo / 1 person' },
                                            { value: 'small', label: 'Small (2–10 employees)' },
                                            { value: 'medium', label: 'Medium (11–50 employees)' },
                                            { value: 'large', label: 'Large (50+ employees)' },
                                        ]}
                                    />
                                    <TargetingSelect
                                        label="Company Age"
                                        value={data.targeting.companyAge}
                                        onChange={v => updateTargeting('companyAge', v as CompanyAge)}
                                        options={[
                                            { value: 'any', label: 'Any age' },
                                            { value: 'new', label: 'New (< 1 year)' },
                                            { value: 'growing', label: 'Growing (1–5 years)' },
                                            { value: 'established', label: 'Established (5+ years)' },
                                        ]}
                                    />
                                    <TargetingSelect
                                        label="Revenue Range"
                                        value={data.targeting.revenueRange}
                                        onChange={v => updateTargeting('revenueRange', v as RevenueRange)}
                                        options={[
                                            { value: 'any', label: 'Any revenue' },
                                            { value: 'under_250k', label: '< $250,000' },
                                            { value: '250k_1m', label: '$250K – $1M' },
                                            { value: '1m_10m', label: '$1M – $10M' },
                                            { value: 'over_10m', label: '$10M+' },
                                        ]}
                                    />
                                    <TargetingSelect
                                        label="Decision Maker Title"
                                        value={data.targeting.decisionMakerTitle}
                                        onChange={v => updateTargeting('decisionMakerTitle', v as DecisionMakerTitle)}
                                        options={[
                                            { value: 'any', label: 'Any title' },
                                            { value: 'owner_founder', label: 'Owner / Founder' },
                                            { value: 'ceo_director', label: 'CEO / Director' },
                                            { value: 'manager', label: 'Manager' },
                                            { value: 'marketing_lead', label: 'Marketing Lead' },
                                        ]}
                                    />
                                    <TargetingSelect
                                        label="Has Website"
                                        value={data.targeting.hasWebsite}
                                        onChange={v => updateTargeting('hasWebsite', v as HasWebsite)}
                                        options={[
                                            { value: 'any', label: 'Any' },
                                            { value: 'yes', label: 'Must have website' },
                                            { value: 'no', label: 'No website' },
                                        ]}
                                    />
                                    <TargetingSelect
                                        label="Operating Hours"
                                        value={data.targeting.operatingHours}
                                        onChange={v => updateTargeting('operatingHours', v as OperatingHours)}
                                        options={[
                                            { value: 'any', label: 'Any hours' },
                                            { value: 'weekdays', label: 'Weekdays only' },
                                            { value: 'weekends', label: 'Weekends' },
                                        ]}
                                    />
                                </div>

                                {/* Targeting Summary */}
                                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                                    <p className="text-xs text-indigo-400 font-medium mb-2 uppercase tracking-wide">Your audience profile</p>
                                    <p className="text-sm text-gray-300">
                                        {data.industry} businesses in {data.location}
                                        {data.targeting.businessSize !== 'any' && ` · ${data.targeting.businessSize} size`}
                                        {data.targeting.companyAge !== 'any' && ` · ${data.targeting.companyAge} company`}
                                        {data.targeting.revenueRange !== 'any' && ` · ${data.targeting.revenueRange.replace('_', '-').replace('under', '<').replace('over', '>')} revenue`}
                                        {data.targeting.decisionMakerTitle !== 'any' && ` · targeting ${data.targeting.decisionMakerTitle.replace('_', '/')}`}
                                        {data.targeting.hasWebsite === 'yes' && ' · with website'}
                                        {data.targeting.hasWebsite === 'no' && ' · no website'}
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3 — Email */}
                        {step === 3 && (
                            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                                <div>
                                    <h2 className="text-xl font-bold mb-1">Craft your outreach email</h2>
                                    <p className="text-gray-500 text-sm">Personalize with smart placeholders the AI will fill in for each contact.</p>
                                </div>

                                <div className="flex flex-wrap gap-2 p-3 bg-black/30 rounded-xl border border-white/5">
                                    <span className="text-xs text-gray-500 w-full mb-1 font-medium">Available placeholders:</span>
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

                        {/* STEP 4 — Review & Launch */}
                        {step === 4 && (
                            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                                <div>
                                    <h2 className="text-xl font-bold mb-1">Review & Launch</h2>
                                    <p className="text-gray-500 text-sm">Everything looks good? Launch the agent to start finding leads.</p>
                                </div>

                                <div className="space-y-0 border border-white/10 rounded-xl overflow-hidden">
                                    <ReviewRow label="Campaign" value={data.name} />
                                    <ReviewRow label="Industry" value={data.industry} />
                                    <ReviewRow label="Location" value={data.location} />
                                    <ReviewRow label="Business Size" value={data.targeting.businessSize === 'any' ? 'Any' : data.targeting.businessSize} />
                                    <ReviewRow label="Company Age" value={data.targeting.companyAge === 'any' ? 'Any' : data.targeting.companyAge} />
                                    <ReviewRow label="Revenue" value={data.targeting.revenueRange === 'any' ? 'Any' : data.targeting.revenueRange} />
                                    <ReviewRow label="Decision Maker" value={data.targeting.decisionMakerTitle === 'any' ? 'Any' : data.targeting.decisionMakerTitle} />
                                    <ReviewRow label="Email Subject" value={data.subject} />
                                </div>

                                <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                    <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Email Preview</p>
                                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed max-h-48 overflow-y-auto">
                                        {data.body.replace('{{companyName}}', 'Acme Corp').replace('{{contactName}}', 'Sarah').replace('{{industry}}', data.industry).replace('{{location}}', data.location)}
                                    </pre>
                                </div>

                                {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">{error}</p>}

                                <button
                                    onClick={handleLaunch}
                                    disabled={loading}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-60"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                                    {loading ? 'Launching Agent...' : 'Launch AI Campaign'}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation Buttons */}
                {step < 4 && (
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
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 rounded-xl text-sm font-semibold transition-all"
                        >
                            Continue <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

const inputCls = "w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all";

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
            {children}
        </div>
    );
}

function TargetingSelect({ label, value, onChange, options }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
}) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">{label}</label>
            <div className="flex flex-wrap gap-1.5">
                {options.map(opt => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${value === opt.value
                            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                            }`}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col sm:flex-row justify-between items-start gap-1 sm:gap-4 px-4 py-3 border-b border-white/5 last:border-0">
            <span className="text-sm text-gray-500 shrink-0">{label}</span>
            <span className="text-sm text-white text-left sm:text-right capitalize break-words w-full sm:w-auto">{value}</span>
        </div>
    );
}
