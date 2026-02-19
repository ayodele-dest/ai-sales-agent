import type { Lead } from '@/types';

export interface CampaignRun {
    id: string;
    campaignId: string;
    userId: string;
    leads: Lead[];
    leadsFound: number;
    sentCount: number;
    openCount: number; // future: tracking
    startedAt: number;
    completedAt: number | null;
    status: 'running' | 'completed' | 'failed';
    // Snapshot of campaign config at time of run
    industry: string;
    location: string;
    targeting?: Record<string, string>;
}

const runs: Map<string, CampaignRun> = new Map();

export function createRun(data: Pick<CampaignRun, 'campaignId' | 'userId' | 'industry' | 'location' | 'targeting'>): CampaignRun {
    const run: CampaignRun = {
        ...data,
        id: crypto.randomUUID(),
        leads: [],
        leadsFound: 0,
        sentCount: 0,
        openCount: 0,
        startedAt: Date.now(),
        completedAt: null,
        status: 'running',
    };
    runs.set(run.id, run);
    return run;
}

export function completeRun(runId: string, leads: Lead[]): CampaignRun | null {
    const run = runs.get(runId);
    if (!run) return null;
    run.leads = leads;
    run.leadsFound = leads.length;
    run.sentCount = leads.filter(l => l.status === 'sent').length;
    run.completedAt = Date.now();
    run.status = 'completed';
    return run;
}

export function getRunsByCampaign(campaignId: string): CampaignRun[] {
    return Array.from(runs.values())
        .filter(r => r.campaignId === campaignId)
        .sort((a, b) => b.startedAt - a.startedAt);
}

export function getRunById(runId: string): CampaignRun | undefined {
    return runs.get(runId);
}

export function getRunSummariesByUser(userId: string): CampaignRun[] {
    return Array.from(runs.values())
        .filter(r => r.userId === userId)
        .sort((a, b) => b.startedAt - a.startedAt);
}
