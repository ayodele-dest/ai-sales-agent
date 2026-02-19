import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { findLeads } from '@/lib/lead-finder';
import { findContact } from '@/lib/scraper';
import { generateEmail } from '@/lib/email-generator';
import { sendEmail } from '@/lib/email-sender';
import { getCampaignById, updateCampaignStatus } from '@/lib/campaign-store';
import { getEmailConnection } from '@/lib/email-connector-store';
import { createRun, completeRun } from '@/lib/campaign-runs-store';
import type { Lead } from '@/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
    const session = await auth();
    const { industry, location, campaignId, targeting } = await req.json();

    if (!industry || !location) {
        return new Response('Missing industry or location', { status: 400 });
    }

    const campaign = campaignId ? getCampaignById(campaignId) : undefined;
    const emailSubject = campaign?.emailTemplate?.subject;
    const emailBody = campaign?.emailTemplate?.body;
    const emailConnection = session?.user?.id ? getEmailConnection(session.user.id) : undefined;

    // Create a run record
    const run = session?.user?.id && campaignId ? createRun({
        campaignId,
        userId: session.user.id,
        industry,
        location,
        targeting: targeting ?? {},
    }) : null;

    if (campaign) updateCampaignStatus(campaignId, 'running');

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            const send = (data: unknown) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            const allLeads: Lead[] = [];

            try {
                const fromLabel = emailConnection
                    ? `${emailConnection.fromName} <${emailConnection.fromEmail}>`
                    : 'simulated sender';
                send({ type: 'LOG', message: `Starting campaign: Searching for ${industry} in ${location}...` });
                send({ type: 'LOG', message: `Sending as: ${fromLabel}` });
                if (run) send({ type: 'RUN_STARTED', runId: run.id });

                const leads = await findLeads(industry, location, targeting);
                send({ type: 'LEADS_FOUND', count: leads.length, leads });

                for (let lead of leads) {
                    send({ type: 'PROCESSING_LEAD', leadId: lead.id, status: 'enriching' });
                    lead = await findContact(lead);
                    send({ type: 'LEAD_UPDATED', lead });

                    if (lead.contact?.email) {
                        send({ type: 'PROCESSING_LEAD', leadId: lead.id, status: 'email_generating' });
                        lead = await generateEmail(lead, emailSubject, emailBody);
                        send({ type: 'LEAD_UPDATED', lead });

                        send({ type: 'PROCESSING_LEAD', leadId: lead.id, status: 'sending' });
                        lead = await sendEmail(lead, emailConnection);
                        send({ type: 'LEAD_UPDATED', lead });
                    }

                    allLeads.push(lead);
                }

                // Persist the completed run
                if (run) {
                    const completedRun = completeRun(run.id, allLeads);
                    if (completedRun) send({ type: 'RUN_COMPLETE', runId: run.id, sentCount: completedRun.sentCount });
                }

                if (campaign) {
                    updateCampaignStatus(campaignId, 'completed',
                        allLeads.length,
                        allLeads.filter(l => l.status === 'sent').length
                    );
                }

                send({ type: 'COMPLETE', leads: allLeads });
                controller.close();
            } catch (error) {
                console.error(error);
                if (run) completeRun(run.id, allLeads);
                if (campaign) updateCampaignStatus(campaignId, 'paused');
                send({ type: 'ERROR', message: 'Campaign failed.' });
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
