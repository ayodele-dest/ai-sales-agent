import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCampaignById } from '@/lib/campaign-store';

// Returns campaign details ready for a relaunch (UI uses this to pre-fill the relaunch)
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const campaign = getCampaignById(id);
    if (!campaign || campaign.userId !== session.user.id) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    // Return the campaign's config — frontend will launch via /api/campaign/start with these params
    return NextResponse.json({
        ready: true,
        campaignId: campaign.id,
        industry: campaign.industry,
        location: campaign.location,
        targeting: campaign.targeting ?? {},
    });
}
