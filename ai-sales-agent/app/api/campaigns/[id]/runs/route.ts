import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getRunsByCampaign } from '@/lib/campaign-runs-store';
import { getCampaignById } from '@/lib/campaign-store';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const campaign = getCampaignById(id);
    if (!campaign || campaign.userId !== session.user.id) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const runs = getRunsByCampaign(id).map(r => ({
        ...r,
        leads: undefined, // strip leads from list — only include in detail endpoint
        leadsSummary: r.leads.slice(0, 3).map(l => ({ companyName: l.companyName, status: l.status })),
    }));

    return NextResponse.json({ runs, campaign });
}
