export default function DetailLoading() {
  return (
    <div className="app-shell">
      <header className="public-header">
        <div style={{ width: 22, height: 22 }} />
        <div style={{ fontSize: 16, fontWeight: 600 }}>Memuat...</div>
        <div style={{ width: 20, height: 20 }} />
      </header>
      <main className="public-page">
        <div className="profile-card" style={{ opacity: 0.6 }}>
          <div className="profile-avatar" />
          <div className="profile-info">
            <div className="name" style={{ background: "var(--neutral-soft)", width: 120, height: 16, borderRadius: 4 }} />
            <div className="meta" style={{ background: "var(--neutral-soft)", width: 80, height: 12, borderRadius: 4 }} />
          </div>
        </div>
        <div className="bill-card" style={{ opacity: 0.6 }}>
          <div style={{ background: "var(--neutral-soft)", width: 100, height: 14, borderRadius: 4, marginBottom: 12 }} />
          <div style={{ background: "var(--neutral-soft)", width: 80, height: 20, borderRadius: 4 }} />
        </div>
      </main>
    </div>
  )
}
