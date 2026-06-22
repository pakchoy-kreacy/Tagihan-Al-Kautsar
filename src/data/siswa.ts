export type StatusBayar = "lunas" | "belum" | "menunggu"

export interface RiwayatPembayaran {
  bulan: string
  tahun: string
  tanggal: string
  nominal: number
  status: StatusBayar
}

export interface Siswa {
  id: string
  nisn: string
  nama: string
  kelas: string
  status: StatusBayar
  tagihan: string
  nominalTagihan: number
  riwayat: RiwayatPembayaran[]
}

export const kelasList = [
  "1A", "1B", "2A", "2B", "3A", "3B",
  "4A", "4B", "5A", "5B", "6A", "6B",
]

export const dataSiswa: Siswa[] = [
  {
    id: "1",
    nisn: "3A-01",
    nama: "Ahmad Rizki",
    kelas: "3A",
    status: "lunas",
    tagihan: "SPP Juli 2026",
    nominalTagihan: 150000,
    riwayat: [
      { bulan: "Juni 2026", tahun: "2026", tanggal: "05 Juni 2026", nominal: 150000, status: "lunas" },
      { bulan: "Mei 2026", tahun: "2026", tanggal: "10 Mei 2026", nominal: 150000, status: "lunas" },
      { bulan: "Agustus 2026", tahun: "2026", tanggal: "—", nominal: 150000, status: "menunggu" },
      { bulan: "September 2026", tahun: "2026", tanggal: "—", nominal: 150000, status: "belum" },
    ],
  },
  {
    id: "2",
    nisn: "3A-02",
    nama: "Aisyah Putri",
    kelas: "3A",
    status: "lunas",
    tagihan: "SPP Juli 2026",
    nominalTagihan: 150000,
    riwayat: [
      { bulan: "Juni 2026", tahun: "2026", tanggal: "03 Juni 2026", nominal: 150000, status: "lunas" },
      { bulan: "Mei 2026", tahun: "2026", tanggal: "08 Mei 2026", nominal: 150000, status: "lunas" },
    ],
  },
  {
    id: "3",
    nisn: "3A-03",
    nama: "Budi Santoso",
    kelas: "3A",
    status: "belum",
    tagihan: "SPP Juli 2026",
    nominalTagihan: 150000,
    riwayat: [
      { bulan: "Juni 2026", tahun: "2026", tanggal: "05 Juni 2026", nominal: 150000, status: "lunas" },
      { bulan: "Juli 2026", tahun: "2026", tanggal: "—", nominal: 150000, status: "belum" },
    ],
  },
  {
    id: "4",
    nisn: "3A-04",
    nama: "Dewi Sartika",
    kelas: "3A",
    status: "lunas",
    tagihan: "SPP Juli 2026",
    nominalTagihan: 150000,
    riwayat: [
      { bulan: "Juni 2026", tahun: "2026", tanggal: "12 Juni 2026", nominal: 150000, status: "lunas" },
      { bulan: "Juli 2026", tahun: "2026", tanggal: "15 Juli 2026", nominal: 150000, status: "lunas" },
    ],
  },
  {
    id: "5",
    nisn: "3A-05",
    nama: "Fahri Alfarizi",
    kelas: "3A",
    status: "belum",
    tagihan: "SPP Juli 2026",
    nominalTagihan: 150000,
    riwayat: [
      { bulan: "Juni 2026", tahun: "2026", tanggal: "—", nominal: 150000, status: "belum" },
      { bulan: "Juli 2026", tahun: "2026", tanggal: "—", nominal: 150000, status: "belum" },
    ],
  },
  {
    id: "6",
    nisn: "3A-06",
    nama: "Siti Aminah",
    kelas: "3A",
    status: "menunggu",
    tagihan: "SPP Juli 2026",
    nominalTagihan: 150000,
    riwayat: [
      { bulan: "Juni 2026", tahun: "2026", tanggal: "20 Juni 2026", nominal: 150000, status: "lunas" },
      { bulan: "Juli 2026", tahun: "2026", tanggal: "—", nominal: 150000, status: "menunggu" },
    ],
  },
  {
    id: "7",
    nisn: "3A-07",
    nama: "Rina Marlina",
    kelas: "3A",
    status: "lunas",
    tagihan: "SPP Juli 2026",
    nominalTagihan: 150000,
    riwayat: [
      { bulan: "Juni 2026", tahun: "2026", tanggal: "02 Juni 2026", nominal: 150000, status: "lunas" },
    ],
  },
  {
    id: "8",
    nisn: "3A-08",
    nama: "Dimas Ardiansyah",
    kelas: "3A",
    status: "lunas",
    tagihan: "SPP Juli 2026",
    nominalTagihan: 150000,
    riwayat: [
      { bulan: "Juni 2026", tahun: "2026", tanggal: "01 Juni 2026", nominal: 150000, status: "lunas" },
    ],
  },
  {
    id: "9",
    nisn: "3A-09",
    nama: "Nurul Hidayah",
    kelas: "3A",
    status: "belum",
    tagihan: "SPP Juli 2026",
    nominalTagihan: 150000,
    riwayat: [],
  },
  {
    id: "10",
    nisn: "3A-10",
    nama: "Rizky Pratama",
    kelas: "3A",
    status: "menunggu",
    tagihan: "SPP Juli 2026",
    nominalTagihan: 150000,
    riwayat: [
      { bulan: "Juli 2026", tahun: "2026", tanggal: "—", nominal: 150000, status: "menunggu" },
    ],
  },
  {
    id: "11",
    nisn: "3A-11",
    nama: "Zahra Ramadhani",
    kelas: "3A",
    status: "lunas",
    tagihan: "SPP Juli 2026",
    nominalTagihan: 150000,
    riwayat: [
      { bulan: "Juni 2026", tahun: "2026", tanggal: "15 Juni 2026", nominal: 150000, status: "lunas" },
    ],
  },
  {
    id: "12",
    nisn: "3A-12",
    nama: "M. Fajar Sidik",
    kelas: "3A",
    status: "lunas",
    tagihan: "SPP Juli 2026",
    nominalTagihan: 150000,
    riwayat: [
      { bulan: "Juni 2026", tahun: "2026", tanggal: "18 Juni 2026", nominal: 150000, status: "lunas" },
    ],
  },
]

export function getSiswaByKelas(kelas: string): Siswa[] {
  return dataSiswa.filter((s) => s.kelas === kelas)
}

export function getSiswaById(id: string): Siswa | undefined {
  return dataSiswa.find((s) => s.id === id)
}

export function formatRupiah(nominal: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(nominal)
}

export function getStatKelas(siswaList: Siswa[]) {
  const total = siswaList.length
  const lunas = siswaList.filter((s) => s.status === "lunas").length
  const belum = siswaList.filter((s) => s.status === "belum").length
  const menunggu = siswaList.filter((s) => s.status === "menunggu").length
  return { total, lunas, belum, menunggu }
}
