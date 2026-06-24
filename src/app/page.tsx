"use client"

import { HomeClient } from "./HomeClient"
import { useSchoolSettings } from "@/components/SchoolSettingsProvider"

export default function BerandaPage() {
  const { settings, kelasList } = useSchoolSettings()
  return <HomeClient settings={settings} kelasList={kelasList} />
}
