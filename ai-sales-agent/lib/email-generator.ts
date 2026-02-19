import { Lead } from '@/types';

export function generateEmailFromTemplate(lead: Lead, subject: string, body: string): string {
    const replace = (template: string) =>
        template
            .replace(/{{companyName}}/g, lead.companyName)
            .replace(/{{contactName}}/g, lead.contact?.name?.split(' ')[0] ?? 'there')
            .replace(/{{industry}}/g, lead.industry)
            .replace(/{{location}}/g, lead.location);

    return `Subject: ${replace(subject)}\n\n${replace(body)}`;
}

export async function generateEmail(lead: Lead, subject?: string, body?: string): Promise<Lead> {
    // Simulate LLM generation time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const finalSubject = subject ?? `Quick question about {{companyName}}'s growth`;
    const finalBody = body ?? `Hi {{contactName}},\n\nI noticed {{companyName}} is doing great work in the {{industry}} space in {{location}}.\n\nI help companies like yours streamline their operations with AI. Would you be open to a 5-minute chat next week?\n\nBest,\n[Your Name]`;

    const content = generateEmailFromTemplate(lead, finalSubject, finalBody);

    return {
        ...lead,
        emailContent: content,
        status: 'email_generated',
        logs: [...lead.logs, 'Drafted personalized outreach email using your campaign template.']
    };
}
