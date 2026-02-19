export type EmailProvider = 'gmail' | 'outlook' | 'yahoo' | 'icloud' | 'custom';

export interface EmailConnection {
    userId: string;
    provider: EmailProvider;
    fromName: string;
    fromEmail: string;
    // SMTP credentials
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    smtpSecure: boolean; // true = TLS on port 465
    connected: boolean;
    connectedAt: number;
}

// Provider presets — user only needs email + app password for these
export const PROVIDER_PRESETS: Record<EmailProvider, Partial<EmailConnection>> = {
    gmail: { smtpHost: 'smtp.gmail.com', smtpPort: 587, smtpSecure: false },
    outlook: { smtpHost: 'smtp-mail.outlook.com', smtpPort: 587, smtpSecure: false },
    yahoo: { smtpHost: 'smtp.mail.yahoo.com', smtpPort: 587, smtpSecure: false },
    icloud: { smtpHost: 'smtp.mail.me.com', smtpPort: 587, smtpSecure: false },
    custom: { smtpHost: '', smtpPort: 587, smtpSecure: false },
};

// In-memory store — one connection per user
const connections: Map<string, EmailConnection> = new Map();

export function getEmailConnection(userId: string): EmailConnection | undefined {
    return connections.get(userId);
}

export function saveEmailConnection(userId: string, data: Omit<EmailConnection, 'userId' | 'connected' | 'connectedAt'>): EmailConnection {
    const conn: EmailConnection = {
        ...data,
        userId,
        connected: true,
        connectedAt: Date.now(),
    };
    connections.set(userId, conn);
    return conn;
}

export function removeEmailConnection(userId: string): void {
    connections.delete(userId);
}
