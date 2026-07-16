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
    let active = true

    async function checkSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!active) return
        if (session?.user) {
          setRole("admin")
        } else {
          window.location.href = "/admin/login"
        }
      } catch {
        if (active) window.location.href = "/admin/login"
      } finally {
        if (active) setLoading(false)
      }
    }

    void checkSession()
    const onPageShow = () => void checkSession()
    window.addEventListener("pageshow", onPageShow)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return
      if (session?.user) {
        setRole("admin")
        setLoading(false)
      } else {
        window.location.href = "/admin/login"
      }
    })

    return () => {
      active = false
      window.removeEventListener("pageshow", onPageShow)
      subscription.unsubscribe()
    }
  }, [])

  // Don't render children until auth check is complete
  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        fontSize: 14,
        color: "#666"
      }}>
        Memuat...
      </div>
    )
  }

  return (
    <AdminRoleContext.Provider value={{ role, loading }}>
      {children}
    </AdminRoleContext.Provider>
  )
}

export function useAdminRole() {
  return useContext(AdminRoleContext)
}
