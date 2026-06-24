import { getSiswaById } from "@/lib/db"
import { DetailClient } from "./DetailClient"
import { notFound } from "next/navigation"

export const revalidate = 60

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DetailSiswaPage({ params }: PageProps) {
  const { id } = await params
  const siswa = await getSiswaById(id)
  if (!siswa) notFound()
  return <DetailClient siswa={siswa} id={id} />
}
