"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"

type AdminRole = "admin" | "viewer" | null

interface AdminRoleContextType {
  role: AdminRole
  loading: boolean
}

const AdminRoleContext = createContext<AdminRoleContextType>({ role: null, loading: true })

async function resolveRole(): Promise<AdminRole | null> {
  for (let i = 0; i < 10; i++) {
    // 1) Restore from localStorage
    const raw = localStorage.getItem("espp_supabase_auth") || localStorage.getItem("espp_admin_session")
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed.access_token) {
          await supabase.auth.setSession({
            access_token: parsed.access_token,
            refresh_token: parsed.refresh_token || "",
          })
        }
      } catch { /* ignore */ }
    }

    // 2) Check session + admin_users
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

    // 3) Try backup token directly
    const backup = localStorage.getItem("espp_admin_session")
    if (backup && !raw) {
      try {
        const parsed = JSON.parse(backup)
        if (parsed.access_token) {
          await supabase.auth.setSession({
            access_token: parsed.access_token,
            refresh_token: parsed.refresh_token || "",
          })
        }
      } catch { /* ignore */ }
    }

    await new Promise(r => setTimeout(r, 300))
  }

  return null
}

export function AdminRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AdminRole>(null)
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true

    resolveRole().then((result) => {
      if (!mounted.current) return
      if (result) {
        setRole(result)
        setLoading(false)
      } else {
        setLoading(false)
        window.location.href = "/admin/login"
      }
    }).catch((err) => {
      console.error("AdminRoleProvider error:", err)
      if (!mounted.current) return
      setLoading(false)
      window.location.href = "/admin/login"
    })

    return () => { mounted.current = false }
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
