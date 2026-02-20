import { PLANS } from './plans';

export interface SubscriptionState {
    planId: string;
    status: 'active' | 'past_due' | 'canceled' | 'trialing';
    currentPeriodEnd: Date;
    emailsSentThisMonth: number;
}

export function getMockSubscription(): SubscriptionState {
    // Default values
    let planId = 'free';
    let status: 'active' | 'past_due' | 'canceled' | 'trialing' = 'active';
    const emailsSentThisMonth = 0;

    // Calculate 30 days from now
    const currentPeriodEnd = new Date();
    currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);

    // Check for overrides in localStorage or query params (client-side only)
    if (typeof window !== 'undefined') {
        // 1. Check URL query params first
        const urlParams = new URLSearchParams(window.location.search);
        const planParam = urlParams.get('plan');

        if (planParam && PLANS[planParam]) {
            planId = planParam;
            // Optionally save this to localStorage so it persists across navigation without the query param
            localStorage.setItem('mock_plan_id', planId);
        } else {
            // 2. Check localStorage
            const storedPlan = localStorage.getItem('mock_plan_id');
            if (storedPlan && PLANS[storedPlan]) {
                planId = storedPlan;
            }
        }
    }

    return {
        planId,
        status,
        currentPeriodEnd,
        emailsSentThisMonth,
    };
}
