import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log('🔍 Middleware executando para:', pathname)

  let response = NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase URL ou Anon Key não definidos')
    return response
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name: string) => request.cookies.get(name)?.value,
      set: (name: string, value: string, options: CookieOptions) => {
        response.cookies.set({
          name,
          value,
          ...options,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        })
      },
      remove: (name: string, options: CookieOptions) => {
        response.cookies.set({
          name,
          value: '',
          ...options,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        })
      },
    },
  })

  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession()

  console.log('📋 Sessão válida:', !!session, 'Erro:', sessionError)

  const isAuthPage = pathname === '/login' || pathname === '/register'
  const publicPaths = ['/', '/suporte', '/exemplo']

  // Já logado → manda pro dashboard
  if (isAuthPage && session) {
    console.log('✅ Usuário logado tentando acessar', pathname, '→ redirecionando para /dashboard')
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Não logado → bloqueia páginas privadas
  if (!session && !isAuthPage && !publicPaths.some((p) => pathname.startsWith(p))) {
    console.log('❌ Usuário não logado tentando acessar', pathname, '→ redirecionando para /login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  console.log('✅ Acesso permitido para:', pathname)
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}