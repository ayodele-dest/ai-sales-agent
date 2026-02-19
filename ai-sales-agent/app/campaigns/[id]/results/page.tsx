'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Download, RefreshCcw, Users, Mail, BarChart3,
    CheckCircle, Clock, ChevronDown, ChevronRight, ExternalLink,
    Bot, Loader2, Calendar, Target, AlertCircle, Search, Archive,
    Trash2, X, FileJson, FileText
} from 'lucide-react';
import type { CampaignRun } from '@/lib/campaign-runs-store';
import type { Campaign } from '@/lib/campaign-store';
import type { Lead } from '@/types';

interface RunSummary extends Omit<CampaignRun, 'leads'> {
    leadsSummary?: { companyName: string; status: string }[];
}

const STATUS_COLORS: Record<string, string> = {
    sent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    failed: 'text-red-400 bg-red-500/10 border-red-500/20',
    contact_found: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    found: 'text-gray-400 bg-gray-800 border-gray-700',
    enriching: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    email_generated: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
};

type Modal = null | 'archive' | 'delete';

export default function CampaignResultsPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [runs, setRuns] = useState<RunSummary[]>([]);
    const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
    const [selectedRun, setSelectedRun] = useState<CampaignRun | null>(null);
    const [loading, setLoading] = useState(true);
    const [runLoading, setRunLoading] = useState(false);
    const [relaunching, setRelaunching] = useState(false);
    const [expandedLead, setExpandedLead] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState<Modal>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetch(`/api/campaigns/${id}/runs`)
            .then(r => r.json())
            .then(d => {
                setCampaign(d.campaign);
                setRuns(d.runs || []);
                if (d.runs?.length > 0) setSelectedRunId(d.runs[0].id);
            })
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if (!selectedRunId) return;
        setRunLoading(true);
        setSelectedRun(null);
        setSearch('');
        fetch(`/api/campaigns/${id}/runs/${selectedRunId}`)
            .then(r => r.json())
            .then(d => setSelectedRun(d.run))
            .finally(() => setRunLoading(false));
    }, [id, selectedRunId]);

    const filteredLeads = useMemo(() => {
        if (!selectedRun) return [];
        const q = search.toLowerCase().trim();
        if (!q) return selectedRun.leads;
        return selectedRun.leads.filter(l =>
            l.companyName.toLowerCase().includes(q) ||
            l.contact?.name?.toLowerCase().includes(q) ||
            l.contact?.email?.toLowerCase().includes(q) ||
            l.industry.toLowerCase().includes(q) ||
            l.location.toLowerCase().includes(q) ||
            l.status.toLowerCase().includes(q)
        );
    }, [selectedRun, search]);

    const handleDownload = (runId: string, format: 'csv' | 'json' = 'csv') => {
        if (format === 'csv') {
            window.open(`/api/campaigns/${id}/runs/${runId}/download`, '_blank');
        } else {
            // JSON export from client
            const run = selectedRun;
            if (!run) return;
            const blob = new Blob([JSON.stringify(run.leads, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `campaign-${campaign?.name.replace(/\s+/g, '-')}-run-${new Date(run.startedAt).toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
    };

    const handleRelaunch = async () => {
        setRelaunching(true);
        const res = await fetch(`/api/campaigns/${id}/relaunch`, { method: 'POST' });
        const data = await res.json();
        if (data.ready) {
            window.location.href = `/dashboard?campaignId=${data.campaignId}&industry=${encodeURIComponent(data.industry)}&location=${encodeURIComponent(data.location)}`;
        }
        setRelaunching(false);
    };

    const handleArchive = async () => {
        setActionLoading(true);
        await fetch(`/api/campaigns/${id}`, { method: 'PATCH' });
        router.push('/campaigns');
    };

    const handleDelete = async () => {
        setActionLoading(true);
        await fetch(`/api/campaigns/${id}`, { method: 'DELETE' });
        router.push('/campaigns');
    };

    const totalLeads = runs.reduce((s, r) => s + r.leadsFound, 0);
    const totalSent = runs.reduce((s, r) => s + r.sentCount, 0);
    const avgLeads = runs.length ? (totalLeads / runs.length).toFixed(1) : '0';

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            {/* Confirm Modals */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-2 rounded-xl ${modal === 'delete' ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
                                {modal === 'delete' ? <Trash2 className="w-5 h-5 text-red-400" /> : <Archive className="w-5 h-5 text-amber-400" />}
                            </div>
                            <button onClick={() => setModal(null)} className="p-1 hover:bg-white/5 rounded-lg text-gray-500 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <h3 className="font-bold text-lg mb-1">
                            {modal === 'delete' ? 'Delete Campaign?' : 'Archive Campaign?'}
                        </h3>
                        <p className="text-sm text-gray-400 mb-6">
                            {modal === 'delete'
                                ? 'This permanently removes the campaign and all its run data. This cannot be undone.'
                                : 'The campaign will be hidden from your main list. You can still view it in archived campaigns.'}
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setModal(null)} className="flex-1 py-2.5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl text-sm font-medium transition-all">
                                Cancel
                            </button>
                            <button
                                onClick={modal === 'delete' ? handleDelete : handleArchive}
                                disabled={actionLoading}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${modal === 'delete' ? 'bg-red-600 hover:bg-red-500' : 'bg-amber-600 hover:bg-amber-500'}`}
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                {modal === 'delete' ? 'Delete' : 'Archive'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="border-b border-white/5 px-6 py-4 sticky top-0 bg-gray-950/90 backdrop-blur-xl z-10">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/campaigns">
                            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-600 rounded-lg"><Bot className="w-4 h-4" /></div>
                            <div>
                                <h1 className="font-bold leading-tight">{campaign?.name ?? '...'}</h1>
                                <p className="text-xs text-gray-500">{campaign?.industry} · {campaign?.location}</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setModal('archive')}
                            className="flex items-center gap-1.5 px-3 py-2 border border-amber-500/20 text-amber-400 hover:bg-amber-500/10 rounded-lg text-sm transition-all"
                        >
                            <Archive className="w-3.5 h-3.5" /> Archive
                        </button>
                        <button
                            onClick={() => setModal('delete')}
                            className="flex items-center gap-1.5 px-3 py-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-lg text-sm transition-all"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                        <Link href={`/campaigns/${id}/edit`}>
                            <button className="flex items-center gap-1.5 px-3 py-2 border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg text-sm transition-all">
                                Edit
                            </button>
                        </Link>
                        <button
                            onClick={handleRelaunch}
                            disabled={relaunching}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-sm font-medium transition-all disabled:opacity-60"
                        >
                            {relaunching ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
                            Relaunch
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-6 space-y-5">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Runs', value: runs.length, icon: BarChart3, color: 'indigo' },
                        { label: 'Total Leads', value: totalLeads, icon: Target, color: 'purple' },
                        { label: 'Emails Sent', value: totalSent, icon: Mail, color: 'emerald' },
                        { label: 'Avg / Run', value: avgLeads, icon: Users, color: 'amber' },
                    ].map(stat => (
                        <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">
                            <div className={`p-2.5 bg-${stat.color}-500/10 rounded-xl shrink-0`}>
                                <stat.icon className={`w-4 h-4 text-${stat.color}-400`} />
                            </div>
                            <div>
                                <p className="text-xl font-bold">{stat.value}</p>
                                <p className="text-xs text-gray-500">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {runs.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
                        <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                        <h3 className="text-gray-400 font-medium mb-1">No runs yet</h3>
                        <p className="text-sm text-gray-600 mb-4">Launch this campaign to see results here.</p>
                        <button onClick={handleRelaunch} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-semibold transition-all">
                            Launch Now
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                        {/* Run List sidebar */}
                        <div className="space-y-2">
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">Run History</h2>
                            {runs.map((run, i) => (
                                <div
                                    key={run.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setSelectedRunId(run.id)}
                                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setSelectedRunId(run.id); }}
                                    className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${selectedRunId === run.id
                                        ? 'bg-indigo-500/10 border-indigo-500/30'
                                        : 'bg-white/5 border-white/10 hover:bg-white/[0.08]'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="text-sm font-semibold">Run #{runs.length - i}</p>
                                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(run.startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${run.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20'}`}>
                                            {run.status}
                                        </span>
                                    </div>
                                    <div className="flex gap-3 mt-2 text-xs text-gray-500">
                                        <span className="flex items-center gap-1"><Target className="w-3 h-3" />{run.leadsFound}</span>
                                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{run.sentCount} sent</span>
                                    </div>
                                    <button
                                        onClick={e => { e.stopPropagation(); handleDownload(run.id, 'csv'); }}
                                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-indigo-400 transition-colors mt-2"
                                    >
                                        <Download className="w-3 h-3" /> CSV
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Lead Detail Panel */}
                        <div className="lg:col-span-2 space-y-3">
                            {runLoading ? (
                                <div className="h-64 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                                </div>
                            ) : selectedRun ? (
                                <>
                                    {/* Controls bar */}
                                    <div className="flex items-center gap-3">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                            <input
                                                value={search}
                                                onChange={e => setSearch(e.target.value)}
                                                placeholder="Search companies, contacts, emails..."
                                                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition-all"
                                            />
                                            {search && (
                                                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDownload(selectedRun.id, 'csv')}
                                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 px-3 py-2.5 rounded-xl transition-all shrink-0"
                                        >
                                            <FileText className="w-3.5 h-3.5" /> CSV
                                        </button>
                                        <button
                                            onClick={() => handleDownload(selectedRun.id, 'json')}
                                            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-white/10 hover:bg-white/5 px-3 py-2.5 rounded-xl transition-all shrink-0"
                                        >
                                            <FileJson className="w-3.5 h-3.5" /> JSON
                                        </button>
                                    </div>

                                    {/* Results count */}
                                    <p className="text-xs text-gray-600">
                                        {search ? `${filteredLeads.length} of ${selectedRun.leads.length} results` : `${selectedRun.leads.length} leads`}
                                        {selectedRun.sentCount > 0 && ` · ${selectedRun.sentCount} emails sent`}
                                    </p>

                                    {/* Lead cards */}
                                    <div className="space-y-2">
                                        {filteredLeads.length === 0 ? (
                                            <div className="text-center py-12 border border-dashed border-white/10 rounded-xl text-gray-600 text-sm">
                                                No leads match "{search}"
                                            </div>
                                        ) : filteredLeads.map((lead: Lead) => (
                                            <div key={lead.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                                                <button
                                                    onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                                                    className="w-full text-left p-4 flex items-center justify-between gap-3 hover:bg-white/5 transition-colors"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 text-sm font-bold text-indigo-400">
                                                            {lead.companyName.charAt(0)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-sm truncate">{lead.companyName}</p>
                                                            <p className="text-xs text-gray-500 truncate">
                                                                {lead.contact?.name
                                                                    ? `${lead.contact.name} · ${lead.contact.email}`
                                                                    : lead.website}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLORS[lead.status] ?? STATUS_COLORS.found}`}>
                                                            {lead.status}
                                                        </span>
                                                        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${expandedLead === lead.id ? 'rotate-180' : ''}`} />
                                                    </div>
                                                </button>

                                                {expandedLead === lead.id && (
                                                    <div className="border-t border-white/5 p-4 space-y-3 bg-black/20">
                                                        {lead.contact && (
                                                            <div className="grid grid-cols-2 gap-3 text-sm">
                                                                <InfoRow label="Contact" value={lead.contact.name} />
                                                                <InfoRow label="Email" value={lead.contact.email} />
                                                                <InfoRow label="Role" value={lead.contact.role} />
                                                                <InfoRow label="Location" value={lead.location} />
                                                            </div>
                                                        )}
                                                        {lead.website && (
                                                            <a href={lead.website} target="_blank" rel="noreferrer"
                                                                className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:underline">
                                                                <ExternalLink className="w-3 h-3" /> {lead.website}
                                                            </a>
                                                        )}
                                                        {lead.emailContent && (
                                                            <div className="bg-black/40 rounded-lg p-3 border border-white/5">
                                                                <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Email Sent</p>
                                                                <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed max-h-40 overflow-y-auto">
                                                                    {lead.emailContent}
                                                                </pre>
                                                            </div>
                                                        )}
                                                        {lead.logs.length > 0 && (
                                                            <div className="space-y-1">
                                                                {lead.logs.map((log, i) => (
                                                                    <p key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                                                                        <CheckCircle className="w-3 h-3 text-gray-700 mt-0.5 shrink-0" />{log}
                                                                    </p>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="h-64 flex items-center justify-center text-gray-600">
                                    <Clock className="w-5 h-5 mr-2" /> Select a run to view details
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm text-white">{value}</p>
        </div>
    );
}
