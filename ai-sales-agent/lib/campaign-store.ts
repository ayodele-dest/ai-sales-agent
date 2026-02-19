import type { Targeting } from '@/types';

export interface EmailTemplate {
    subject: string;
    body: string;
}

export interface Campaign {
    id: string;
    userId: string;
    name: string;
    industry: string;
    location: string;
    targeting?: Targeting;
    emailTemplate: EmailTemplate;
    status: 'draft' | 'running' | 'completed' | 'paused' | 'archived';
    leadsCount: number;
    sentCount: number;
    createdAt: number;
    archivedAt?: number;
}

// In-memory store — swap with DB in production
const campaigns: Map<string, Campaign> = new Map();

export function createCampaign(data: Omit<Campaign, 'id' | 'createdAt' | 'status' | 'leadsCount' | 'sentCount'>): Campaign {
    const campaign: Campaign = {
        ...data,
        id: crypto.randomUUID(),
        status: 'draft',
        leadsCount: 0,
        sentCount: 0,
        createdAt: Date.now(),
    };
    campaigns.set(campaign.id, campaign);
    return campaign;
}

export function getCampaignsByUser(userId: string): Campaign[] {
    return Array.from(campaigns.values())
        .filter(c => c.userId === userId)
        .sort((a, b) => b.createdAt - a.createdAt);
}

export function getCampaignById(id: string): Campaign | undefined {
    return campaigns.get(id);
}

export function updateCampaignStatus(id: string, status: Campaign['status'], leadsCount?: number, sentCount?: number): void {
    const campaign = campaigns.get(id);
    if (campaign) {
        campaign.status = status;
        if (leadsCount !== undefined) campaign.leadsCount = leadsCount;
        if (sentCount !== undefined) campaign.sentCount = sentCount;
    }
}

export function updateCampaign(
    id: string,
    userId: string,
    patch: Partial<Pick<Campaign, 'name' | 'industry' | 'location' | 'emailTemplate' | 'targeting'>>
): Campaign | null {
    const campaign = campaigns.get(id);
    if (!campaign || campaign.userId !== userId) return null;
    Object.assign(campaign, patch);
    return campaign;
}

export function archiveCampaign(id: string, userId: string): Campaign | null {
    const campaign = campaigns.get(id);
    if (!campaign || campaign.userId !== userId) return null;
    campaign.status = 'archived';
    campaign.archivedAt = Date.now();
    return campaign;
}

export function deleteCampaign(id: string, userId: string): boolean {
    const campaign = campaigns.get(id);
    if (!campaign || campaign.userId !== userId) return false;
    campaigns.delete(id);
    return true;
}
