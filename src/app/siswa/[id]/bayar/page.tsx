import { getSiswaById } from "@/lib/db"
import { getBankInfoByType } from "@/lib/infaq-db"
import { BayarClient } from "./BayarClient"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ id: string }>
}

export const revalidate = 30

export default async function BayarPage({ params }: PageProps) {
  const { id } = await params
  const [siswa, bank] = await Promise.all([
    getSiswaById(id),
    getBankInfoByType("payment").then(b => b || getBankInfoByType("infaq")),
  ])
  if (!siswa) notFound()
  return <BayarClient siswa={siswa} bank={bank} id={id} />
}
