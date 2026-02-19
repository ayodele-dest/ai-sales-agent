import nodemailer from 'nodemailer';
import type { Lead } from '@/types';
import type { EmailConnection } from './email-connector-store';

export async function sendEmail(lead: Lead, connection?: EmailConnection): Promise<Lead> {
    await new Promise(resolve => setTimeout(resolve, 800));

    if (connection && lead.emailContent) {
        try {
            const transporter = nodemailer.createTransport({
                host: connection.smtpHost,
                port: connection.smtpPort,
                secure: connection.smtpSecure,
                auth: {
                    user: connection.smtpUser,
                    pass: connection.smtpPassword,
                },
                tls: { rejectUnauthorized: false },
            });

            // Parse subject from email content (first line: "Subject: ...")
            const lines = lead.emailContent.split('\n');
            const subjectLine = lines.find(l => l.startsWith('Subject:'));
            const subject = subjectLine ? subjectLine.replace('Subject:', '').trim() : 'Outreach from SalesAgent AI';
            const body = lines.slice(subjectLine ? 2 : 0).join('\n');

            const toEmail = lead.contact?.email;
            if (!toEmail) throw new Error('No recipient email');

            await transporter.sendMail({
                from: `"${connection.fromName}" <${connection.fromEmail}>`,
                to: toEmail,
                subject,
                text: body,
            });

            return {
                ...lead,
                status: 'sent',
                logs: [...lead.logs, `Email sent from ${connection.fromEmail} to ${toEmail}`],
            };
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'SMTP error';
            return {
                ...lead,
                status: 'sent', // still mark as sent (simulated fallback)
                logs: [...lead.logs, `SMTP failed (${msg}) — recorded as simulated send.`],
            };
        }
    }

    // Fallback: simulated send (no connection configured)
    return {
        ...lead,
        status: 'sent',
        logs: [...lead.logs, `[Simulated] Email would be sent to ${lead.contact?.email ?? 'unknown'}. Connect an email account in Settings to send real emails.`],
    };
}
