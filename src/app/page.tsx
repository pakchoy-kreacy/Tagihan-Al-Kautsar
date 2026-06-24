import { HomeClient } from "./HomeClient"
import { getAllClasses } from "@/lib/db"
import { getSchoolSettings } from "@/lib/infaq-db"

export const dynamic = "force-dynamic"

export default async function BerandaPage() {
  const [settings, kelasList] = await Promise.all([
    getSchoolSettings(),
    getAllClasses(),
  ])

  return <HomeClient settings={settings} kelasList={kelasList} />
}
