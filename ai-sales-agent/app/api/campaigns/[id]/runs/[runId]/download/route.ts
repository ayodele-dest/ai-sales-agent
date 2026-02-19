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

    // Build CSV
    const rows: string[][] = [
        ['Company', 'Website', 'Industry', 'Location', 'Contact Name', 'Email', 'Role', 'Status'],
        ...run.leads.map(l => [
            l.companyName,
            l.website,
            l.industry,
            l.location,
            l.contact?.name ?? '',
            l.contact?.email ?? '',
            l.contact?.role ?? '',
            l.status,
        ]),
    ];

    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const filename = `campaign-${campaign.name.replace(/\s+/g, '-')}-run-${new Date(run.startedAt).toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    });
}
