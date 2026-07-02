"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getSiswaById, type Siswa } from "@/lib/db"
import { DetailClient } from "./DetailClient"

export default function DetailSiswaPage() {
  const params = useParams()
  const id = params.id as string
  const [siswa, setSiswa] = useState<Siswa | null>(null)

  useEffect(() => {
    if (!id) return
    let mounted = true

    async function fetchData() {
      const s = await getSiswaById(id)
      if (mounted) setSiswa(s || null)
    }

    fetchData()
    const interval = setInterval(fetchData, 30000)
    const onVisible = () => { if (!document.hidden) fetchData() }
    document.addEventListener("visibilitychange", onVisible)

    return () => {
      mounted = false
      clearInterval(interval)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [id])

  return <DetailClient siswa={siswa} id={id} />
}
