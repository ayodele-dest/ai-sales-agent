'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { LeadsTable } from '@/components/dashboard/LeadsTable';
import { StatusLog } from '@/components/dashboard/StatusLog';
import { AgentCard } from '@/components/dashboard/AgentCard';
import type { Lead } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Bot, Target, MapPin, CheckCircle, Loader2, Download } from 'lucide-react';

function DashboardContent() {
    const searchParams = useSearchParams();
    const industry = searchParams.get('industry') ?? '';
    const location = searchParams.get('location') ?? '';
    const campaignId = searchParams.get('campaignId') ?? '';

    const [leads, setLeads] = useState<Lead[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<'idle' | 'working' | 'completed'>('idle');
    const [currentAction, setCurrentAction] = useState('Initializing...');

    useEffect(() => {
        if (industry && location && status === 'idle') {
            startCampaign(industry, location);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [industry, location]);

    async function startCampaign(ind: string, loc: string) {
        setStatus('working');
        setLogs([`Starting campaign for ${ind} in ${loc}...`]);
        setCurrentAction('Connecting to agent...');

        try {
            const response = await fetch('/api/campaign/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ industry: ind, location: loc, campaignId }),
            });

            if (!response.body) throw new Error('No stream body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const event = JSON.parse(line.replace('data: ', ''));
                            handleEvent(event);
                        } catch { /* ignore parse errors */ }
                    }
                }
            }
            setStatus('completed');
            setLogs(prev => [...prev, '✅ Campaign finished successfully.']);
            setCurrentAction('All tasks completed.');
        } catch (err) {
            console.error(err);
            setLogs(prev => [...prev, 'Error: Campaign failed unexpectedly.']);
            setStatus('idle');
        }
    }

    function handleEvent(event: Record<string, unknown>) {
        switch (event.type) {
            case 'LOG':
                setLogs(prev => [...prev, event.message as string]);
                setCurrentAction(event.message as string);
                break;
            case 'LEADS_FOUND':
                setLeads(event.leads as Lead[]);
                setLogs(prev => [...prev, `Found ${event.count} potential leads.`]);
                setCurrentAction('Analysing leads...');
                break;
            case 'PROCESSING_LEAD':
                setLeads(prev => prev.map(l =>
                    l.id === event.leadId ? { ...l, status: event.status as Lead['status'] } : l
                ));
                const actionMap: Record<string, string> = {
                    enriching: 'Enriching contact info...',
                    email_generating: 'Writing personalised email...',
                    sending: 'Sending outreach email...',
                };
                if (actionMap[event.status as string]) setCurrentAction(actionMap[event.status as string]);
                break;
            case 'LEAD_UPDATED':
                setLeads(prev => prev.map(l =>
                    l.id === (event.lead as Lead).id ? event.lead as Lead : l
                ));
                const lead = event.lead as Lead;
                if (lead.logs?.length) setLogs(prev => [...prev, lead.logs[lead.logs.length - 1]]);
                break;
            case 'COMPLETE':
                setLeads(event.leads as Lead[]);
                break;
        }
    }

    const sentCount = leads.filter(l => l.status === 'sent').length;

    const handleDownloadCSV = () => {
        if (!leads.length) return;
        const headers = ['Company', 'Website', 'Industry', 'Location', 'Contact Name', 'Email', 'Role', 'Status'];
        const rows = leads.map(l => [
            l.companyName, l.website ?? '', l.industry, l.location,
            l.contact?.name ?? '', l.contact?.email ?? '', l.contact?.role ?? '', l.status
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `campaign-${industry.replace(/\s+/g, '-')}-${location.replace(/\s+/g, '-')}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            {/* Sticky header */}
            <header className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur-xl border-b border-white/5 px-6 py-3.5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/campaigns">
                            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-indigo-600 rounded-lg">
                                <Bot className="w-4 h-4" />
                            </div>
                            <div>
                                <h1 className="font-bold text-sm leading-tight">Mission Control</h1>
                                <p className="text-xs text-gray-500 flex items-center gap-2">
                                    <span className="flex items-center gap-1">
                                        <Target className="w-2.5 h-2.5" />{industry}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-2.5 h-2.5" />{location}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Live stats */}
                        {leads.length > 0 && (
                            <div className="hidden sm:flex items-center gap-4 text-xs font-medium mr-2">
                                <span className="text-gray-500">{leads.length} <span className="text-gray-400">leads</span></span>
                                <span className="text-emerald-400">{sentCount} <span className="text-gray-400">sent</span></span>
                            </div>
                        )}

                        {/* Download */}
                        {status === 'completed' && leads.length > 0 && (
                            <button
                                onClick={handleDownloadCSV}
                                className="flex items-center gap-1.5 px-3 py-2 border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg text-xs font-medium transition-all"
                            >
                                <Download className="w-3.5 h-3.5" /> Export CSV
                            </button>
                        )}

                        {/* Status pill */}
                        {status === 'working' && (
                            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg text-blue-300 text-xs font-medium">
                                <Loader2 className="w-3 h-3 animate-spin" /> Running
                            </div>
                        )}
                        {status === 'completed' && (
                            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-emerald-300 text-xs font-medium">
                                <CheckCircle className="w-3 h-3" /> Complete
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Body */}
            <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 h-full">
                    {/* Left column */}
                    <div className="space-y-4">
                        <AgentCard status={status} currentAction={currentAction} />
                        <div className="h-[380px]">
                            <StatusLog logs={logs} />
                        </div>
                        {status === 'completed' && campaignId && (
                            <Link href={`/campaigns/${campaignId}/results`} className="block">
                                <div className="flex items-center justify-center gap-2 py-3 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/5 rounded-xl text-sm font-medium transition-all cursor-pointer">
                                    View Full Results
                                </div>
                            </Link>
                        )}
                    </div>

                    {/* Right column */}
                    <div className="lg:col-span-2">
                        <LeadsTable leads={leads} />
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        }>
            <DashboardContent />
        </Suspense>
    );
}
