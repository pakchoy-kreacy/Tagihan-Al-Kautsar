"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

type AdminRole = "admin" | "viewer" | null

interface AdminRoleContextType {
  role: AdminRole
  loading: boolean
}

const AdminRoleContext = createContext<AdminRoleContextType>({ role: null, loading: true })

async function resolveRole(): Promise<AdminRole> {
  for (let i = 0; i < 10; i++) {
    // 1) Try getSession first (fast if session already in memory)
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user?.email) {
      const { data } = await supabase
        .from("admin_users")
        .select("role")
        .eq("email", session.user.email)
        .maybeSingle()
      const role = (data as { role: AdminRole } | null)?.role
      if (role) return role
    }

    // 2) Try restoring from localStorage directly
    const raw = localStorage.getItem("espp_supabase_auth") || localStorage.getItem("espp_admin_session")
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        const accessToken = parsed.access_token
        const refreshToken = parsed.refresh_token || ""
        if (accessToken) {
          const { data } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
          if (data?.session?.user?.email) {
            const result = await supabase
              .from("admin_users")
              .select("role")
              .eq("email", data.session.user.email)
              .maybeSingle()
            const role = (result.data as { role: AdminRole } | null)?.role
            if (role) return role
          }
        }
      } catch { /* ignore */ }
    }

    await new Promise(r => setTimeout(r, 500))
  }

  return null
}

export function AdminRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AdminRole>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true

    let mounted = true

    resolveRole().then((result) => {
      if (!mounted) return

      if (result) {
        setRole(result)
        setLoading(false)
      } else {
        setLoading(false)
        router.replace("/admin/login")
      }
    })

    return () => { mounted = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <AdminRoleContext.Provider value={{ role, loading }}>
      {children}
    </AdminRoleContext.Provider>
  )
}

export function useAdminRole() {
  return useContext(AdminRoleContext)
}
