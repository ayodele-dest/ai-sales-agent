export interface PlanLimit {
    monthlyEmails: number;
    campaigns: number | 'unlimited';
}

export interface Plan {
    id: string;
    name: string;
    priceMonthly: number;
    limits: PlanLimit;
    features: string[];
}

export const PLANS: Record<string, Plan> = {
    free: {
        id: 'free',
        name: 'Free',
        priceMonthly: 0,
        limits: {
            monthlyEmails: 100,
            campaigns: 1
        },
        features: [
            '1 Active Campaign',
            '100 Emails / month',
            'Basic Support'
        ]
    },
    starter: {
        id: 'starter',
        name: 'Starter',
        priceMonthly: 49,
        limits: {
            monthlyEmails: 1000,
            campaigns: 5
        },
        features: [
            '5 Active Campaigns',
            '1,000 Emails / month',
            'Priority Support',
            'Custom Sending Domains'
        ]
    },
    growth: {
        id: 'growth',
        name: 'Growth',
        priceMonthly: 99,
        limits: {
            monthlyEmails: 5000,
            campaigns: 'unlimited'
        },
        features: [
            'Unlimited Campaigns',
            '5,000 Emails / month',
            '24/7 Premium Support',
            'API Access'
        ]
    }
};
