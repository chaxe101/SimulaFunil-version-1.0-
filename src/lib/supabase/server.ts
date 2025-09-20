
import { createServerClient as createServerClientOriginal, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Abordagem assíncrona corrigida para Next.js 15+, conforme orientação.
// A função agora é `async` e aguarda `cookies()` internamente.
export async function createServerClient() {
  const cookieStore = await cookies()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL or Anon Key is not defined in environment variables for server client.');
  }

  return createServerClientOriginal(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // O `set` foi chamado de um Server Component.
            // Isso pode ser ignorado se você tiver um middleware atualizando as sessões.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // O `delete` foi chamado de um Server Component.
            // Isso pode ser ignorado se você tiver um middleware atualizando as sessões.
          }
        },
      },
    }
  )
}
