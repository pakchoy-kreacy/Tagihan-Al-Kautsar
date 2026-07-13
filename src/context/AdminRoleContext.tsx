"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"

type AdminRole = "admin" | "viewer" | null

interface AdminRoleContextType {
  role: AdminRole
  loading: boolean
}

const AdminRoleContext = createContext<AdminRoleContextType>({ role: null, loading: true })

export function AdminRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<AdminRole>(null)
  const [loading, setLoading] = useState(true)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true

    async function init() {
      // 1) Use cached role from localStorage if available
      const cachedRole = localStorage.getItem("espp_role")
      if (cachedRole === "admin" || cachedRole === "viewer") {
        setRole(cachedRole)
        setLoading(false)
        return
      }

      // 2) Fallback: restore session from tokens + query admin_users
      for (let i = 0; i < 10; i++) {
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

        if (!mounted.current) return

        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.email) {
          const { data } = await supabase
            .from("admin_users")
            .select("role")
            .eq("email", session.user.email)
            .maybeSingle()
          const r = (data as { role: AdminRole } | null)?.role
          if (r) {
            localStorage.setItem("espp_role", r)
            setRole(r)
            setLoading(false)
            return
          }
        }

        await new Promise(r => setTimeout(r, 300))
      }

      // No session after retries → redirect to login
      if (!mounted.current) return
      setLoading(false)
      setRole(null)
      window.location.href = "/admin/login"
    }

    init().catch((err) => {
      console.error("AdminRoleProvider error:", err)
      if (!mounted.current) return
      setLoading(false)
      window.location.href = "/admin/login"
    })

    return () => { mounted.current = false }
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
