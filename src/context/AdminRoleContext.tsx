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

let singletonPromise: Promise<AdminRole> | null = null

async function resolveRole(): Promise<AdminRole> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user?.email) return null

  const { data } = await supabase
    .from("admin_users")
    .select("role")
    .eq("email", session.user.email)
    .maybeSingle()

  return (data as { role: AdminRole } | null)?.role || null
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
    let attempts = 0

    async function check() {
      while (mounted && attempts < 15) {
        attempts++

        if (!singletonPromise) {
          singletonPromise = resolveRole()
        }

        const result = await singletonPromise

        if (!mounted) return

        if (result !== null) {
          setRole(result)
          setLoading(false)
          return
        }

        singletonPromise = null
        await new Promise(r => setTimeout(r, 500))
      }

      if (!mounted) return
      setLoading(false)
      router.replace("/admin/login")
    }

    check()
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
