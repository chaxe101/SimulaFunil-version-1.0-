import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Criamos uma resposta base
  let response = NextResponse.next()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Supabase URL ou Anon Key não definidos')
    return response
  }

  // Aqui o supabase já pode manipular cookies pela response (não no Server Component!)
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
          sameSite: 'lax', // troquei de strict → lax p/ evitar sumir cookies entre abas
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
  } = await supabase.auth.getSession()

  const { pathname } = request.nextUrl
  const isAuthPage = pathname === '/login' || pathname === '/register'
  const publicPaths = ['/', '/suporte', '/exemplo']

  // Já logado → manda pro dashboard
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Não logado → bloqueia páginas privadas
  if (!session && !isAuthPage && !publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // protege tudo, exceto estáticos/imagens
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
