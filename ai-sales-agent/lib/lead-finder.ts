import { Lead } from '@/types';
import type { Targeting } from '@/types';

// Richer mock pool — covers multiple industries and sizes
const MOCK_COMPANIES = [
    { name: 'TechFlow Solutions', industry: 'Software', size: 'medium', hasWebsite: true, hours: 'weekdays' },
    { name: 'Apex Innovations', industry: 'Software', size: 'small', hasWebsite: true, hours: 'weekdays' },
    { name: 'Vertex Systems', industry: 'Software', size: 'large', hasWebsite: true, hours: 'weekdays' },
    { name: 'Nova Logic', industry: 'Software', size: 'small', hasWebsite: true, hours: 'weekdays' },
    { name: 'Quantum Soft', industry: 'Software', size: 'solo', hasWebsite: false, hours: 'weekdays' },
    { name: 'BlueSky Digital', industry: 'Marketing', size: 'small', hasWebsite: true, hours: 'weekdays' },
    { name: 'IronClad Security', industry: 'Cybersecurity', size: 'medium', hasWebsite: true, hours: 'weekdays' },
    { name: 'GreenLeaf Energy', industry: 'Clean Tech', size: 'medium', hasWebsite: true, hours: 'weekdays' },
    { name: 'Cornerstone Cafe', industry: 'Food & Bev', size: 'small', hasWebsite: true, hours: 'weekends' },
    { name: 'The Daily Grind', industry: 'Food & Bev', size: 'solo', hasWebsite: false, hours: 'weekends' },
    { name: 'Bright Spark Electric', industry: 'Trades', size: 'small', hasWebsite: false, hours: 'weekdays' },
    { name: 'Summit Roofing Co.', industry: 'Trades', size: 'medium', hasWebsite: true, hours: 'weekdays' },
    { name: 'Lavender Beauty Lounge', industry: 'Beauty', size: 'solo', hasWebsite: true, hours: 'weekends' },
    { name: 'Premier Physio', industry: 'Healthcare', size: 'small', hasWebsite: true, hours: 'weekdays' },
    { name: 'Atlas Accounting', industry: 'Finance', size: 'small', hasWebsite: true, hours: 'weekdays' },
    { name: 'Rapid Results Fitness', industry: 'Health', size: 'medium', hasWebsite: true, hours: 'weekends' },
];

// Map targeting size options to rough employee bands for display
const SIZE_LABEL: Record<string, string> = {
    solo: '1 person',
    small: '2–10 employees',
    medium: '11–50 employees',
    large: '50+ employees',
};

const AGE_LABEL: Record<string, string> = {
    new: '< 1 year old',
    growing: '1–5 years',
    established: '5+ years',
};

export async function findLeads(
    industry: string,
    location: string,
    targeting?: Partial<Targeting>
): Promise<Lead[]> {
    console.log(`[LeadFinder] Searching for ${industry} in ${location}...`);
    if (targeting && Object.values(targeting).some(v => v && v !== 'any')) {
        console.log(`[LeadFinder] Applying targeting filters:`, targeting);
    }

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    let pool = [...MOCK_COMPANIES];

    // ── Apply targeting filters ──────────────────────────────────────────────

    // Business size filter
    if (targeting?.businessSize && targeting.businessSize !== 'any') {
        pool = pool.filter(c => c.size === targeting.businessSize);
    }

    // Has website filter
    if (targeting?.hasWebsite === 'yes') {
        pool = pool.filter(c => c.hasWebsite);
    } else if (targeting?.hasWebsite === 'no') {
        pool = pool.filter(c => !c.hasWebsite);
    }

    // Operating hours filter
    if (targeting?.operatingHours && targeting.operatingHours !== 'any') {
        pool = pool.filter(c => c.hours === targeting.operatingHours);
    }

    // If no companies survive the filters, fall back to full pool
    // (avoids returning 0 results in the prototype)
    if (pool.length === 0) pool = [...MOCK_COMPANIES];

    // ── Determine how many leads to return ──────────────────────────────────
    // More specific targeting → fewer but more relevant results (realistic UX)
    const activeFilters = targeting
        ? Object.values(targeting).filter(v => v && v !== 'any').length
        : 0;
    const baseCount = 5;
    const count = Math.max(2, baseCount - Math.floor(activeFilters * 0.5));

    // ── Build lead objects ───────────────────────────────────────────────────
    const leads: Lead[] = Array.from({ length: count }).map(() => {
        const company = pool[Math.floor(Math.random() * pool.length)];

        // Build a descriptive log that reflects the targeting used
        const logs: string[] = [`Found company via search: ${company.name}`];
        if (targeting?.businessSize && targeting.businessSize !== 'any') {
            logs.push(`Matches size filter: ${SIZE_LABEL[targeting.businessSize] ?? targeting.businessSize}`);
        }
        if (targeting?.companyAge && targeting.companyAge !== 'any') {
            logs.push(`Estimated company age: ${AGE_LABEL[targeting.companyAge] ?? targeting.companyAge}`);
        }
        if (targeting?.revenueRange && targeting.revenueRange !== 'any') {
            logs.push(`Estimated revenue range: ${targeting.revenueRange.replace(/_/g, ' ')}`);
        }
        if (targeting?.decisionMakerTitle && targeting.decisionMakerTitle !== 'any') {
            logs.push(`Targeting decision maker: ${targeting.decisionMakerTitle.replace(/_/g, '/')}`);
        }

        return {
            id: crypto.randomUUID(),
            companyName: `${company.name} — ${location}`,
            website: company.hasWebsite ? `${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.example.com` : '',
            industry: industry || company.industry,
            location,
            status: 'found',
            logs,
        } satisfies Lead;
    });

    console.log(`[LeadFinder] Returning ${leads.length} leads (${activeFilters} active targeting filters)`);
    return leads;
}
