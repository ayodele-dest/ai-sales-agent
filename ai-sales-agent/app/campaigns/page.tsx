'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    Plus, Rocket, Users, Mail, ChevronRight, Bot, LogOut, Zap,
    Pencil, Settings, BarChart3, RefreshCcw, LineChart, Download, Target,
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { Campaign } from '@/lib/campaign-store';

interface CampaignWithRuns extends Campaign {
    runCount: number;
    lastRunAt?: number;
}

export default function CampaignsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<CampaignWithRuns[]>([]);
    const [relaunching, setRelaunching] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchCampaigns = useCallback(async () => {
        const res = await fetch('/api/campaigns');
        const d = await res.json();
        const raw: Campaign[] = d.campaigns || [];

        // Enrich with run counts
        const enriched = await Promise.all(raw.map(async c => {
            try {
                const r = await fetch(`/api/campaigns/${c.id}/runs`);
                const rd = await r.json();
                const runs: { startedAt: number }[] = rd.runs || [];
                return { ...c, runCount: runs.length, lastRunAt: runs[0]?.startedAt };
            } catch {
                return { ...c, runCount: 0 };
            }
        }));

        // Redirect to onboarding if this is their very first time
        if (enriched.length === 0) {
            router.push('/onboarding');
            return;
        }

        setCampaigns(enriched);
        setLoading(false);
    }, [router]);

    useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

    const handleRelaunch = async (campaign: CampaignWithRuns, e: React.MouseEvent) => {
        e.preventDefault();
        setRelaunching(campaign.id);
        const res = await fetch(`/api/campaigns/${campaign.id}/relaunch`, { method: 'POST' });
        const data = await res.json();
        if (data.ready) {
            router.push(`/dashboard?campaignId=${data.campaignId}&industry=${encodeURIComponent(data.industry)}&location=${encodeURIComponent(data.location)}`);
        }
        setRelaunching(null);
    };

    const totalLeads = campaigns.reduce((s, c) => s + c.leadsCount, 0);
    const totalSent = campaigns.reduce((s, c) => s + c.sentCount, 0);
    const totalRuns = campaigns.reduce((s, c) => s + c.runCount, 0);

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Navbar */}
            <nav className="border-b border-white/5 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-600 rounded-lg"><Bot className="w-5 h-5" /></div>
                    <span className="font-bold text-lg">SalesAgent AI</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">
                        Welcome, <span className="text-white font-medium">{session?.user?.name}</span>
                    </span>
                    <Link href="/settings">
                        <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-lg">
                            <Settings className="w-4 h-4" />
                        </button>
                    </Link>
                    <button onClick={() => signOut({ callbackUrl: '/auth' })} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-8 py-12">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold">Your Campaigns</h1>
                        <p className="text-gray-500 mt-1">Manage your AI-powered outreach campaigns.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {campaigns.length >= 2 && (
                            <Link href="/campaigns/compare">
                                <button className="flex items-center gap-2 border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all">
                                    <LineChart className="w-4 h-4" /> Compare
                                </button>
                            </Link>
                        )}
                        <Link href="/campaigns/new">
                            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors">
                                <Plus className="w-5 h-5" /> New Campaign
                            </button>
                        </Link>
                    </div>
                </div>

                {/* Stats Bar */}
                {campaigns.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mb-10">
                        {[
                            { label: 'Campaigns', value: campaigns.length, icon: Rocket, color: 'indigo' },
                            { label: 'Total Runs', value: totalRuns, icon: BarChart3, color: 'violet' },
                            { label: 'Total Leads', value: totalLeads, icon: Target, color: 'purple' },
                            { label: 'Emails Sent', value: totalSent, icon: Mail, color: 'emerald' },
                        ].map(stat => (
                            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                                <div className={`p-3 bg-${stat.color}-500/10 rounded-xl`}>
                                    <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-xs text-gray-500">{stat.label}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="space-y-3">
                    {campaigns.map((campaign, i) => (
                        <motion.div
                            key={campaign.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-indigo-500/20 transition-all"
                        >
                            <div className="flex items-start justify-between gap-4">
                                {/* Left: info */}
                                <div className="flex items-start gap-4 min-w-0">
                                    <div className="p-2.5 bg-indigo-500/10 rounded-xl shrink-0">
                                        <Rocket className="w-5 h-5 text-indigo-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="font-semibold text-white">{campaign.name}</h3>
                                            <StatusBadge status={campaign.status} />
                                            {campaign.runCount > 0 && (
                                                <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                                                    {campaign.runCount} run{campaign.runCount > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 mt-0.5">{campaign.industry} · {campaign.location}</p>
                                        <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-600">
                                            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{campaign.leadsCount} leads found</span>
                                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{campaign.sentCount} emails sent</span>
                                            {campaign.lastRunAt && (
                                                <span>Last run {new Date(campaign.lastRunAt).toLocaleDateString()}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: actions */}
                                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                                    {campaign.runCount > 0 && (
                                        <Link href={`/campaigns/${campaign.id}/results`}>
                                            <button className="flex items-center gap-1.5 border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                                                <BarChart3 className="w-3.5 h-3.5" /> Results
                                            </button>
                                        </Link>
                                    )}
                                    <Link href={`/campaigns/${campaign.id}/edit`}>
                                        <button className="flex items-center gap-1.5 border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white px-3 py-2 rounded-lg text-xs font-medium transition-colors">
                                            <Pencil className="w-3.5 h-3.5" /> Edit
                                        </button>
                                    </Link>
                                    {campaign.runCount > 0 && (
                                        <button
                                            onClick={e => handleRelaunch(campaign, e)}
                                            disabled={relaunching === campaign.id}
                                            className="flex items-center gap-1.5 border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 hover:text-indigo-300 px-3 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-60"
                                        >
                                            <RefreshCcw className={`w-3.5 h-3.5 ${relaunching === campaign.id ? 'animate-spin' : ''}`} />
                                            {relaunching === campaign.id ? 'Launching...' : 'Relaunch'}
                                        </button>
                                    )}
                                    <Link href={`/dashboard?campaignId=${campaign.id}&industry=${encodeURIComponent(campaign.industry)}&location=${encodeURIComponent(campaign.location)}`}>
                                        <button className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                            Launch <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        draft: 'bg-gray-800 text-gray-400 border-gray-700',
        running: 'bg-blue-500/10 text-blue-400 border-blue-500/20 animate-pulse',
        completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        paused: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    };
    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize inline-block ${map[status] || map.draft}`}>
            {status}
        </span>
    );
}
