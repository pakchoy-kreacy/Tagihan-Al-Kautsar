<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Goal
Fix all remaining bugs (lint errors, data staleness, navigation delay, visual issues) and optimize performance for instant page loads across all admin and public pages.

## Constraints & Preferences
- All public & admin pages must auto-refresh data without manual reload.
- Public pages must render immediately (no loading skeleton), fetch data in background.
- Navigation must use native `<a>` tags instead of `router.push()` for instant perceived performance.
- Loading feedback ("Memuat...") must appear on click.
- Dropdown tagihan should show only tagihan name + nominal (no extra jatuh tempo info).
- Detail siswa must display ALL active unpaid bills with total sum.
- All static data (settings, classes, bank info) must be prefetched once and cached in localStorage.
- Sidebar admin should not have logo + school name (only in top navbar).

## Progress
### Done
- **Lint fixed 21→0**: replaced `<a>`→`<Link>` in error.tsx, not-found.tsx, DetailClient.tsx, BayarClient.tsx, bayar/page.tsx, NavBar.tsx. Restructured setState-in-effect patterns (derive from pathname, useMemo for previewUrl, initial state from props). Replaced `any` casts in db.ts with proper `Bill` type. Removed unused imports, added missing deps.
- **Auto-refresh all admin pages**: Dashboard (30s polling + Supabase Realtime on payments & bills), Verifikasi (15s polling + Realtime), Siswa/Kelas/Tagihan/Rekap/Infaq (30s polling + visibilitychange). Pengaturan excluded (settings rarely change).
- **Auto-refresh all public pages**: Beranda (60s), Cari Siswa (30s), Detail Siswa (30s), Bayar (30s), Infaq (60s) — all with visibilitychange.
- **LocalStorage cache**: `getSchoolSettings()` now caches (`espp_school_settings_data`), `getAllClasses()` already cached (`espp_classes`), `getBankInfoByType()` now caches per type (`espp_bank_info_payment`, `espp_bank_info_infaq`). Background refresh on read.
- **No loading skeleton on public pages**: Beranda initialized from cache (settings + kelas), renders HomeClient immediately. Public siswa/detail/bayar/infaq pages render content component immediately with null/empty data, fetch updates in background.
- **Native `<a>` tags replace `router.push()`**: HomeClient ("Lihat Data Siswa", "Infaq Sekolah"), DetailClient ("Bayar Sekarang"), BayarClient ("Kembali ke Detail"), InfaqClient ("Kembali ke Beranda", "Kembali") — all use native `<a href>` for instant browser navigation.
- **Loading indicator on click**: HomeClient buttons show "Memuat..." after click via `setNavigating(true)`.
- **Dropdown tagihan simplified**: Shows only `{bill_type_name || bulan} — {formatRupiah(nominal)}`. No extra jatuh tempo text.
- **Tagihan Aktif shows all bills**: DetailClient now maps `activeBills` (all unpaid), shows each with name + status badge + jatuh tempo + nominal, plus total sum at bottom.
- **SchoolSettingsProvider prefetches all data**: Loads `getSchoolSettings()`, `getAllClasses()`, `getBankInfoByType('payment')`, `getBankInfoByType('infaq')` in parallel on mount. Context provides `settings`, `kelasList`, `bankPayment`, `bankInfaq` to all children.
- **Beranda & Infaq pages simplified**: Both now read from `useSchoolSettings()` context directly — no local fetch, no useEffect, no loading state.
- **Bayar page optimized**: Gets bank from context instead of fetching separately (removed 1 Supabase query). Only fetches `getSiswaById()`.
- **NavBar `<Link>`→`<a>`**: Admin link no longer requires double click (instant browser navigation).
- **Sidebar logo removed**: Duplicate logo + "ESPP MI" removed from admin sidebar (keep only top navbar).
- **Build & lint always 0 errors 0 warnings**.

### In Progress
- *(none)*

### Blocked
- `supabase-rls.sql` must be run in Supabase SQL Editor (adds 3 columns: `school_settings.alamat`, `bill_types.batas_waktu`, `bill_types.berlaku_untuk_kelas`).

## Next Steps
1. Run `supabase-rls.sql` in Supabase SQL Editor.
2. Deploy to Vercel.
