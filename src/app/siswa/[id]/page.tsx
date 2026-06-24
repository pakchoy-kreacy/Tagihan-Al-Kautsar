import { getSiswaById } from "@/lib/db"
import { DetailClient } from "./DetailClient"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

export const revalidate = 30

export default async function DetailSiswaPage({ params }: PageProps) {
  const { id } = await params
  const siswa = await getSiswaById(id)
  if (!siswa) notFound()
  return <DetailClient siswa={siswa} id={id} />
}
