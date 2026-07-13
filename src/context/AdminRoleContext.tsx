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

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted.current) return

      if (session?.user?.email) {
        const { data } = await supabase
          .from("admin_users")
          .select("role")
          .eq("email", session.user.email)
          .maybeSingle()

        if (!mounted.current) return

        if (data) {
          setRole((data as { role: AdminRole }).role)
          setLoading(false)
          return
        }
      }

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
