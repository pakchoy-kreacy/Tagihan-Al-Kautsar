export function Preconnect() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return null
  const hostname = new URL(url).hostname
  return (
    <>
      <link rel="preconnect" href={`https://${hostname}`} crossOrigin="anonymous" />
      <link rel="dns-prefetch" href={`https://${hostname}`} />
    </>
  )
}
