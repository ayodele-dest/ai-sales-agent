import { NextRequest, NextResponse } from 'next/server';
import { createUser } from '@/lib/auth-store';

export async function POST(req: NextRequest) {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    if (password.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const user = await createUser(name, email, password);
    if (!user) {
        return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    return NextResponse.json({ success: true, userId: user.id }, { status: 201 });
}
