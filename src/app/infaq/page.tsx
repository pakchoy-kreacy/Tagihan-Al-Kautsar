import { getBankInfoByType } from "@/lib/infaq-db"
import { InfaqClient } from "./InfaqClient"

export const dynamic = "force-dynamic"

export default async function InfaqPage() {
  const bank = await getBankInfoByType("infaq")
  return <InfaqClient bank={bank} />
}
