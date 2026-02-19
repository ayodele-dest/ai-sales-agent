import { Lead } from '@/types';

const MOCK_CONTACTS = [
    { name: 'Sarah Jenkins', role: 'Head of Marketing' },
    { name: 'Michael Chen', role: 'Chief Technology Officer' },
    { name: 'Emily Davis', role: 'Founder & CEO' },
    { name: 'James Wilson', role: 'V.P. Sales' },
];

export async function findContact(lead: Lead): Promise<Lead> {
    // Simulate scraping delay
    const delay = Math.floor(Math.random() * 2000) + 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // 80% chance of finding a contact
    if (Math.random() > 0.2) {
        const contact = MOCK_CONTACTS[Math.floor(Math.random() * MOCK_CONTACTS.length)];
        const email = `${contact.name.toLowerCase().replace(' ', '.')}@${lead.website.replace('www.', '')}`;

        return {
            ...lead,
            contact: {
                name: contact.name,
                role: contact.role,
                email: email,
                linkedin: `linkedin.com/in/${contact.name.toLowerCase().replace(' ', '-')}`
            },
            status: 'contact_found',
            logs: [...lead.logs, `Scraped ${lead.website}`, `Found potential contact: ${contact.name} (${contact.role})`]
        };
    } else {
        return {
            ...lead,
            logs: [...lead.logs, `Scraped ${lead.website}`, 'No direct contact found, using generic info.'],
            // Fallback
            contact: {
                name: 'Contact Team',
                role: 'General Inquiry',
                email: `contact@${lead.website.replace('www.', '')}`
            },
            status: 'contact_found'
        };
    }
}
