"use client"

import { useEffect, useState } from "react"
import { getBankInfoByType } from "@/lib/infaq-db"
import type { BankInfoSettings } from "@/lib/infaq-db"
import { InfaqClient } from "./InfaqClient"

export default function InfaqPage() {
  const [bank, setBank] = useState<BankInfoSettings | null>(null)

  useEffect(() => {
    let mounted = true

    async function fetchData() {
      const b = await getBankInfoByType("infaq")
      if (mounted) setBank(b)
    }

    fetchData()
    const interval = setInterval(fetchData, 60000)
    const onVisible = () => { if (!document.hidden) fetchData() }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      mounted = false
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [])

  return <InfaqClient bank={bank} />
}
