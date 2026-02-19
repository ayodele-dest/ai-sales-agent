import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getEmailConnection } from '@/lib/email-connector-store';
import nodemailer from 'nodemailer';

// POST — test the connection by sending a test email to themselves
export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { smtpHost, smtpPort, smtpSecure, smtpUser, smtpPassword, fromName, fromEmail } = body;

    if (!smtpHost || !smtpUser || !smtpPassword || !fromEmail) {
        return NextResponse.json({ error: 'Missing SMTP credentials' }, { status: 400 });
    }

    try {
        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort || 587,
            secure: smtpSecure || false,
            auth: { user: smtpUser, pass: smtpPassword },
            tls: { rejectUnauthorized: false },
            connectionTimeout: 8000,
            greetingTimeout: 5000,
        });

        await transporter.verify();

        // Send a real test email to the user themselves
        await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: fromEmail,
            subject: '✅ SalesAgent AI — Connection Verified',
            text: `Your email account is successfully connected to SalesAgent AI.\n\nYou can now send outreach campaigns from ${fromEmail}.\n\n— SalesAgent AI`,
        });

        return NextResponse.json({ ok: true, message: `Test email sent to ${fromEmail}` });
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        return NextResponse.json({ error: `SMTP Error: ${message}` }, { status: 400 });
    }
}
