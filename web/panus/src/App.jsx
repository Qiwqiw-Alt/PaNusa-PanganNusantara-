import { useState, useEffect } from 'react'
import LandSuitabilityAnalyzer from './LandSuitabilityAnalyzer'
import Login from './Login'
import AdminDashboard from './AdminDashboard'

function App() {
  const [userSession, setUserSession] = useState(null)

  useEffect(() => {
    // Cek sesi saat awal load
    const session = localStorage.getItem('panus_session');
    if (session) {
      setUserSession(JSON.parse(session));
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('panus_session');
    setUserSession(null);
  }

  return (
    <>
      {/* Jika sudah login, tampilkan tombol logout di atas */}
      {userSession && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
          <span className="text-xs font-medium text-[#6B6354] bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#E4DECF] shadow-sm">
            {userSession.role === 'pengelola' ? '🛡️ Pengelola' : '🧑‍🌾 User'}: {userSession.name}
          </span>
          <button 
            onClick={handleLogout}
            className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-600 px-4 py-2 rounded-full text-xs font-semibold shadow-sm hover:bg-red-100 transition-colors"
          >
            Keluar
          </button>
        </div>
      )}

      {/* Tampilkan halaman berdasarkan sesi */}
      {!userSession ? (
        <Login onLoginSuccess={(user) => setUserSession(user)} />
      ) : userSession.role === 'pengelola' ? (
        <AdminDashboard />
      ) : (
        <LandSuitabilityAnalyzer userSession={userSession} />
      )}
    </>
  )
}

export default App
