"use client"

import { InfaqClient } from "./InfaqClient"
import { useSchoolSettings } from "@/components/SchoolSettingsProvider"

export default function InfaqPage() {
  const { bankInfaq } = useSchoolSettings()
  return <InfaqClient bank={bankInfaq} />
}
