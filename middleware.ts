import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_EMAIL = 'emco7h@gmail.com'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes - no auth needed
  if (pathname.startsWith('/login') || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in → redirect to login
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Client trying to access admin area → redirect to their portal
  if (user.email !== ADMIN_EMAIL && !pathname.startsWith('/portal')) {
    // Find their workspace
    const { data: member } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('email', user.email!)
      .single()

    if (member) {
      return NextResponse.redirect(new URL(`/portal/${member.workspace_id}`, request.url))
    }
    // No workspace found → back to login
    return NextResponse.redirect(new URL('/login?error=no_access', request.url))
  }

  // Admin trying to access portal → redirect to admin home
  if (user.email === ADMIN_EMAIL && pathname.startsWith('/portal')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
