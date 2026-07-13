import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function createMissingEnvProxy() {
  return new Proxy({}, {
    get() {
      throw new Error('Missing Supabase environment variables')
    },
  })
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            keepalive: true,
          })
        },
      },
      realtime: {
        params: {
          eventsPerSecond: 2,
        },
      },
    })
  : (createMissingEnvProxy() as ReturnType<typeof createClient>)
