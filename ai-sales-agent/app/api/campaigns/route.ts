import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { createCampaign, getCampaignsByUser } from '@/lib/campaign-store';

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const campaigns = getCampaignsByUser(session.user.id);
    return NextResponse.json({ campaigns });
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, industry, location, emailTemplate, targeting } = body;

    if (!name || !industry || !location || !emailTemplate?.subject || !emailTemplate?.body) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const campaign = createCampaign({
        userId: session.user.id,
        name,
        industry,
        location,
        targeting,
        emailTemplate,
    });

    return NextResponse.json({ campaign }, { status: 201 });
}
