export default function InfaqLoading() {
  return (
    <div className="app-shell">
      <div style={{ padding: "16px 20px", background: "var(--emerald)", color: "white", display: "flex", justifyContent: "center" }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>Memuat...</div>
      </div>
      <main className="app-main">
        <div className="app-grid">
          <div className="card" style={{ padding: 32, textAlign: "center" }}>
            <div className="loading-text">Memuat informasi infaq...</div>
          </div>
        </div>
      </main>
    </div>
  )
}
