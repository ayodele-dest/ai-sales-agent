import bcrypt from 'bcryptjs';

export interface User {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    createdAt: number;
}

// In-memory store — swap this for a real DB (Prisma/Supabase) in production
const users: Map<string, User> = new Map();

export async function createUser(name: string, email: string, password: string): Promise<User | null> {
    const existing = getUserByEmail(email);
    if (existing) return null; // Email already registered

    const passwordHash = await bcrypt.hash(password, 10);
    const user: User = {
        id: crypto.randomUUID(),
        email: email.toLowerCase().trim(),
        name,
        passwordHash,
        createdAt: Date.now(),
    };
    users.set(user.id, user);
    return user;
}

export function getUserByEmail(email: string): User | undefined {
    return Array.from(users.values()).find(u => u.email === email.toLowerCase().trim());
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
}
