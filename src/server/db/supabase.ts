import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// 1. SSR Client (Admin Dashboard için)
// Kullanıcının tarayıcısındaki Cookie'leri kullanarak oturum açar.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Component içinde cookie set edilemez, hata yutulur.
          }
        },
      },
    }
  )
}

// 2. Admin Client (Service Role - Public Sayfalar ve Cron Joblar için)
// RLS kurallarını atlayarak (Bypass) tüm veriye erişir.
// DİKKAT: Sadece Server Component'lerde kullanılmalıdır!
export const getAdminClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // .env dosyanızda bu anahtarın olduğundan emin olun
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  )
}