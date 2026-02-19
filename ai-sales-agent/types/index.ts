export type LeadStatus = 'found' | 'enriching' | 'contact_found' | 'email_generating' | 'email_generated' | 'sending' | 'sent' | 'failed';

export type BusinessSize = 'any' | 'solo' | 'small' | 'medium' | 'large';
export type CompanyAge = 'any' | 'new' | 'growing' | 'established';
export type RevenueRange = 'any' | 'under_250k' | '250k_1m' | '1m_10m' | 'over_10m';
export type DecisionMakerTitle = 'any' | 'owner_founder' | 'ceo_director' | 'manager' | 'marketing_lead';
export type HasWebsite = 'any' | 'yes' | 'no';
export type OperatingHours = 'any' | 'weekdays' | 'weekends';

export interface Targeting {
  businessSize: BusinessSize;
  companyAge: CompanyAge;
  revenueRange: RevenueRange;
  decisionMakerTitle: DecisionMakerTitle;
  hasWebsite: HasWebsite;
  operatingHours: OperatingHours;
}

export interface Lead {
  id: string;
  companyName: string;
  website: string;
  industry: string;
  location: string;
  contact?: {
    name: string;
    email: string;
    role: string;
    linkedin?: string;
  };
  emailContent?: string;
  status: LeadStatus;
  logs: string[];
}

export interface Campaign {
  id: string;
  keywords: string;
  industry: string;
  location: string;
  leads: Lead[];
  createdAt: number;
  status: 'running' | 'completed' | 'paused';
}

export type AgentAction =
  | { type: 'SEARCHING'; query: string }
  | { type: 'ANALYZING_SITE'; url: string }
  | { type: 'FOUND_CONTACT'; email: string }
  | { type: 'GENERATING_EMAIL'; recipient: string }
  | { type: 'SENDING_EMAIL'; recipient: string }
  | { type: 'COMPLETE'; count: number };
