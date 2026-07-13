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

      // 2) Get current session
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.email) {
        // No session → redirect to login
        setLoading(false)
        window.location.href = "/admin/login"
        return
      }

      // 3) Query role from admin_users (single attempt, no retry)
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

      // 4) Role not found → redirect to login
      setLoading(false)
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
