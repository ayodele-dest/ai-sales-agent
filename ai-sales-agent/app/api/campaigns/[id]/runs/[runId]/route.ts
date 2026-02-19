import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getRunById } from '@/lib/campaign-runs-store';
import { getCampaignById } from '@/lib/campaign-store';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; runId: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id, runId } = await params;
    const campaign = getCampaignById(id);
    if (!campaign || campaign.userId !== session.user.id) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const run = getRunById(runId);
    if (!run || run.campaignId !== id) {
        return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    }

    return NextResponse.json({ run, campaign });
}
