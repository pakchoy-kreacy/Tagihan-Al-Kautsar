export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <style>{`
        @keyframes logoSpin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
      <div className="loading-logo" style={{ animation: "logoSpin 1.5s ease-in-out infinite" }}>
        MI
      </div>
      <div className="loading-text-animated" style={{ animation: "fadeInUp 0.5s ease forwards" }}>
        Memuat data...
      </div>
      <div className="loading-dots">
        <span style={{ animation: "pulse 1.2s ease-in-out 0s infinite" }} />
        <span style={{ animation: "pulse 1.2s ease-in-out 0.2s infinite" }} />
        <span style={{ animation: "pulse 1.2s ease-in-out 0.4s infinite" }} />
      </div>
    </div>
  )
}
