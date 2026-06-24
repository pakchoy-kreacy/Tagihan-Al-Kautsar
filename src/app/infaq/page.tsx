import { getBankInfoByType } from "@/lib/infaq-db"
import { InfaqClient } from "./InfaqClient"

export const revalidate = 30

export default async function InfaqPage() {
  const bank = await getBankInfoByType("infaq")
  return <InfaqClient bank={bank} />
}
