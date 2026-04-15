import { NextResponse, type NextRequest } from 'next/server'

// Middleware disabled - auth handled client-side on each page
export async function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
