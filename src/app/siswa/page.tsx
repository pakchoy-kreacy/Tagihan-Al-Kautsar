import { SiswaClient } from "./SiswaClient"
import { getStudentsByClass, getActiveYear } from "@/lib/db"

export const dynamic = "force-dynamic"

interface PageProps {
  searchParams: Promise<{ kelas?: string }>
}

export default async function DaftarSiswaPage({ searchParams }: PageProps) {
  const params = await searchParams
  const kelas = params.kelas || "3A"
  const [allSiswa, tahunAjaran] = await Promise.all([
    getStudentsByClass(kelas),
    getActiveYear(),
  ])

  return <SiswaClient kelas={kelas} tahunAjaran={tahunAjaran} allSiswa={allSiswa} />
}
