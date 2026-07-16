"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { getSiswaById, type Siswa } from "@/lib/db"
import { DetailClient } from "./DetailClient"
import { usePageRefresh } from "@/hooks/usePageRefresh"

export default function DetailSiswaPage() {
  const params = useParams()
  const id = params.id as string
  const [siswa, setSiswa] = useState<Siswa | null>(null)
  const [loadedId, setLoadedId] = useState("")

  usePageRefresh(async (isCurrent) => {
    if (!id) return
    const nextSiswa = await getSiswaById(id)
    if (!isCurrent()) return
    setSiswa(nextSiswa || null)
    setLoadedId(id)
  }, { refreshKey: id })

  return <DetailClient siswa={loadedId === id ? siswa : null} id={id} />
}
