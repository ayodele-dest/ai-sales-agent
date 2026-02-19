'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Bot, BarChart3, Check, Target, Mail, TrendingUp, X } from 'lucide-react';
import type { Campaign } from '@/lib/campaign-store';

interface CampaignWithStats extends Campaign {
    totalLeads: number;
    totalSent: number;
    totalRuns: number;
}

const COLORS = ['indigo', 'purple', 'amber'];

export default function ComparePage() {
    const [allCampaigns, setAllCampaigns] = useState<CampaignWithStats[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch campaigns + their run stats
        Promise.all([fetch('/api/campaigns').then(r => r.json())])
            .then(async ([campaignData]) => {
                const campaigns: Campaign[] = campaignData.campaigns || [];
                const enriched: CampaignWithStats[] = await Promise.all(
                    campaigns.map(async c => {
                        try {
                            const r = await fetch(`/api/campaigns/${c.id}/runs`);
                            const d = await r.json();
                            const runs = d.runs || [];
                            return {
                                ...c,
                                totalRuns: runs.length,
                                totalLeads: runs.reduce((s: number, r: { leadsFound: number }) => s + r.leadsFound, 0),
                                totalSent: runs.reduce((s: number, r: { sentCount: number }) => s + r.sentCount, 0),
                            };
                        } catch {
                            return { ...c, totalRuns: 0, totalLeads: 0, totalSent: 0 };
                        }
                    })
                );
                setAllCampaigns(enriched);
            })
            .finally(() => setLoading(false));
    }, []);

    const toggle = (id: string) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 3 ? [...prev, id] : prev
        );
    };

    const comparingCampaigns = selected.map(id => allCampaigns.find(c => c.id === id)!).filter(Boolean);
    const maxLeads = Math.max(...comparingCampaigns.map(c => c.totalLeads), 1);
    const maxSent = Math.max(...comparingCampaigns.map(c => c.totalSent), 1);
    const maxRuns = Math.max(...comparingCampaigns.map(c => c.totalRuns), 1);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="border-b border-white/5 px-6 py-4">
                <div className="max-w-6xl mx-auto flex items-center gap-3">
                    <Link href="/campaigns">
                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-600 rounded-lg"><Bot className="w-4 h-4" /></div>
                        <div>
                            <h1 className="font-bold">Compare Campaigns</h1>
                            <p className="text-xs text-gray-500">Select up to 3 campaigns to compare side by side</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
                {/* Picker */}
                <div>
                    <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">Select Campaigns</h2>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse" />)}
                        </div>
                    ) : allCampaigns.length === 0 ? (
                        <div className="text-center py-12 border border-dashed border-white/10 rounded-xl text-gray-600">
                            No campaigns yet. <Link href="/campaigns/new" className="text-indigo-400 hover:underline">Create one</Link>.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {allCampaigns.map(c => {
                                const selIdx = selected.indexOf(c.id);
                                const isSelected = selIdx !== -1;
                                const colorIdx = isSelected ? selIdx : -1;
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => toggle(c.id)}
                                        disabled={!isSelected && selected.length >= 3}
                                        className={`text-left p-4 rounded-xl border transition-all relative ${isSelected
                                                ? `bg-${COLORS[colorIdx]}-500/10 border-${COLORS[colorIdx]}-500/30`
                                                : 'bg-white/5 border-white/10 hover:bg-white/8 disabled:opacity-40 disabled:cursor-not-allowed'
                                            }`}
                                    >
                                        {isSelected && (
                                            <span className={`absolute top-2 right-2 w-5 h-5 rounded-full bg-${COLORS[colorIdx]}-500 flex items-center justify-center`}>
                                                <Check className="w-3 h-3 text-white" />
                                            </span>
                                        )}
                                        <p className="font-medium text-sm pr-6 truncate">{c.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5 truncate">{c.industry} · {c.location}</p>
                                        <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                            <span>{c.totalRuns} runs</span>
                                            <span>{c.totalLeads} leads</span>
                                            <span>{c.totalSent} sent</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Comparison View */}
                {comparingCampaigns.length >= 2 && (
                    <div className="space-y-6">
                        <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Comparison</h2>

                        {/* Side-by-side stat cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                                { label: 'Total Runs', icon: BarChart3, key: 'totalRuns' as const, max: maxRuns },
                                { label: 'Leads Found', icon: Target, key: 'totalLeads' as const, max: maxLeads },
                                { label: 'Emails Sent', icon: Mail, key: 'totalSent' as const, max: maxSent },
                            ].map(stat => (
                                <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <stat.icon className="w-4 h-4 text-gray-500" />
                                        <span className="text-sm text-gray-400 font-medium">{stat.label}</span>
                                    </div>
                                    <div className="space-y-3">
                                        {comparingCampaigns.map((c, i) => (
                                            <div key={c.id}>
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className={`text-${COLORS[i]}-400 truncate max-w-[70%]`}>{c.name}</span>
                                                    <span className="font-bold text-white">{c[stat.key]}</span>
                                                </div>
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full bg-${COLORS[i]}-500 transition-all duration-700`}
                                                        style={{ width: `${stat.max > 0 ? (c[stat.key] / stat.max) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Details table */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            <div className="px-5 py-3 border-b border-white/5 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-400">Campaign Details</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-white/5">
                                            <th className="text-left px-5 py-3 text-xs text-gray-500 font-medium">Metric</th>
                                            {comparingCampaigns.map((c, i) => (
                                                <th key={c.id} className={`text-left px-5 py-3 text-xs text-${COLORS[i]}-400 font-medium`}>
                                                    {c.name}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {[
                                            { label: 'Industry', key: 'industry' as const },
                                            { label: 'Location', key: 'location' as const },
                                            { label: 'Status', key: 'status' as const },
                                        ].map(row => (
                                            <tr key={row.label} className="hover:bg-white/3 transition-colors">
                                                <td className="px-5 py-3 text-gray-500">{row.label}</td>
                                                {comparingCampaigns.map(c => (
                                                    <td key={c.id} className="px-5 py-3 text-white capitalize">{c[row.key]}</td>
                                                ))}
                                            </tr>
                                        ))}
                                        {[
                                            { label: 'Total Runs', key: 'totalRuns' as const },
                                            { label: 'Total Leads Found', key: 'totalLeads' as const },
                                            { label: 'Emails Sent', key: 'totalSent' as const },
                                        ].map(row => (
                                            <tr key={row.label} className="hover:bg-white/3 transition-colors">
                                                <td className="px-5 py-3 text-gray-500">{row.label}</td>
                                                {comparingCampaigns.map((c, i) => {
                                                    const isMax = c[row.key] === Math.max(...comparingCampaigns.map(x => x[row.key]));
                                                    return (
                                                        <td key={c.id} className={`px-5 py-3 font-semibold ${isMax && comparingCampaigns.length > 1 ? `text-${COLORS[i]}-400` : 'text-white'}`}>
                                                            {c[row.key]} {isMax && comparingCampaigns.length > 1 && '🏆'}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {comparingCampaigns.length === 1 && (
                    <div className="text-center py-8 text-gray-600 text-sm border border-dashed border-white/10 rounded-xl">
                        Select at least one more campaign to compare
                    </div>
                )}
            </div>
        </div>
    );
}
