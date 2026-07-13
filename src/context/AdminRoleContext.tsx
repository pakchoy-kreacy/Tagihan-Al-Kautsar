"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
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

  useEffect(() => {
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) {
        setRole(null)
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from("admin_users")
        .select("role")
        .eq("email", user.email)
        .maybeSingle()

      setRole((data as { role: AdminRole } | null)?.role || null)
      setLoading(false)
    }

    fetchRole()
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
