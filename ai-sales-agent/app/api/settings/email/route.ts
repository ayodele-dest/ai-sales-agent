import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getEmailConnection, saveEmailConnection, removeEmailConnection, PROVIDER_PRESETS } from '@/lib/email-connector-store';
import type { EmailProvider } from '@/lib/email-connector-store';
import nodemailer from 'nodemailer';

// GET — fetch current connection (password masked)
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const conn = getEmailConnection(session.user.id);
    if (!conn) return NextResponse.json({ connection: null });

    // Mask password
    return NextResponse.json({
        connection: { ...conn, smtpPassword: '••••••••' },
    });
}

// PUT — save email connection
export async function PUT(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { provider, fromName, fromEmail, smtpPassword, smtpHost, smtpPort, smtpSecure, smtpUser } = body;

    if (!provider || !fromName || !fromEmail || !smtpPassword) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const preset = PROVIDER_PRESETS[provider as EmailProvider];
    const conn = saveEmailConnection(session.user.id, {
        provider,
        fromName,
        fromEmail,
        smtpHost: smtpHost || preset.smtpHost || '',
        smtpPort: smtpPort || preset.smtpPort || 587,
        smtpSecure: smtpSecure ?? preset.smtpSecure ?? false,
        smtpUser: smtpUser || fromEmail, // default username = email address
        smtpPassword,
    });

    return NextResponse.json({ connection: { ...conn, smtpPassword: '••••••••' } });
}

// DELETE — disconnect
export async function DELETE() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    removeEmailConnection(session.user.id);
    return NextResponse.json({ ok: true });
}
