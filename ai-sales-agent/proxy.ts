import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const { pathname } = req.nextUrl;
    const isLoggedIn = !!req.auth;

    // Public routes - always accessible
    const publicRoutes = ['/', '/auth', '/api/auth', '/api/auth/signup'];
    const isPublic = publicRoutes.some(r => pathname === r || pathname.startsWith('/api/auth'));

    if (!isLoggedIn && !isPublic) {
        return NextResponse.redirect(new URL('/auth', req.url));
    }

    // If logged in, redirect away from auth page
    if (isLoggedIn && pathname === '/auth') {
        return NextResponse.redirect(new URL('/campaigns', req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
