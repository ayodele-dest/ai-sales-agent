import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getCampaignById, archiveCampaign, deleteCampaign } from '@/lib/campaign-store';

// PATCH — archive
export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const campaign = archiveCampaign(id, session.user.id);
    if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ campaign });
}

// DELETE — permanently remove
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const ok = deleteCampaign(id, session.user.id);
    if (!ok) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ deleted: true });
}

// GET — single campaign
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const campaign = getCampaignById(id);
    if (!campaign || campaign.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ campaign });
}
