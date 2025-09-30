import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getPageUrl } from "@/lib/utils";

export function middleware(request: NextRequest) {
    if (request.nextUrl.pathname.includes('/login')) {
        return NextResponse.next()
    }

    if (request.nextUrl.pathname.startsWith('/admin') || request.nextUrl.pathname.startsWith('/api/admin')) {
        const userData = request.cookies.get('user')?.value
        const user = userData ? JSON.parse(userData) : null
        if (!user) {
            return NextResponse.redirect(new URL(getPageUrl('/login'), request.url))
        }

        if (user && user.role !== 'ADMIN') {
            return NextResponse.redirect(new URL(getPageUrl('/'), request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/admin/:path*', '/api/admin/:path*'],
}