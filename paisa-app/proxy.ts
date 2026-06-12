import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js Middleware (now proxy.ts in v16+) 
 * Handles Supabase session refreshing and route protection.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Update request cookies for the current execution
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          
          // Create new response to carry the cookies
          response = NextResponse.next({
            request,
          })
          
          // Set cookies on the response
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // This will refresh the session if needed
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()

  // 1. If user is authenticated and tries to access login/signup, redirect to dashboard
  if (user && (url.pathname === '/login' || url.pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // 2. Protect dashboard routes
  const protectedRoutes = ['/dashboard', '/history', '/settings', '/join-household']
  const isProtectedRoute = protectedRoutes.some(path => url.pathname.startsWith(path))
  
  if (!user && isProtectedRoute) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', url.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // IMPORTANT: Always return the response object!
  // This ensures that refreshed cookies are sent back to the browser.
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
