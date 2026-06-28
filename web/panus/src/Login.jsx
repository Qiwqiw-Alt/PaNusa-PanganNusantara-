import { useState, useEffect } from "react";
import { Sprout, Mail, Lock, User, ArrowRight, ShieldCheck, Users } from "lucide-react";

// Akun pengelola default (karena pengelola tidak bisa daftar)
const DEFAULT_PENGELOLA = {
  email: "admin@panus.com",
  password: "admin",
  name: "Pengelola Sistem",
  role: "pengelola"
};

export default function Login({ onLoginSuccess }) {
  const [role, setRole] = useState("user"); // 'user' | 'pengelola'
  const [isRegistering, setIsRegistering] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Feedback state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Inisialisasi local storage jika belum ada
  useEffect(() => {
    if (!localStorage.getItem("panus_users")) {
      localStorage.setItem("panus_users", JSON.stringify([]));
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isRegistering) {
      // LOGIKA REGISTER (Hanya untuk User)
      try {
        // Ambil data users dari server/file lokal
        const res = await fetch('/api/users');
        const users = await res.json();
        
        // Cek apakah email sudah terdaftar
        if (users.find(u => u.email === email)) {
          setError("Email sudah terdaftar!");
          return;
        }
        
        // Simpan user baru ke file
        const newUser = { name, email, password, role: "user" };
        await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
        
        setSuccess("Pendaftaran berhasil! Silakan masuk.");
        setIsRegistering(false);
        setPassword(""); // kosongkan password
      } catch (err) {
        setError("Gagal menghubungi server untuk mendaftar.");
      }
    } else {
      // LOGIKA LOGIN
      if (role === "pengelola") {
        if (email === DEFAULT_PENGELOLA.email && password === DEFAULT_PENGELOLA.password) {
          setSuccess("Berhasil masuk sebagai Pengelola!");
          localStorage.setItem("panus_session", JSON.stringify(DEFAULT_PENGELOLA));
          if (onLoginSuccess) onLoginSuccess(DEFAULT_PENGELOLA);
        } else {
          setError("Kredensial Pengelola salah!");
        }
      } else {
        try {
          // Baca file users.json lewat API
          const res = await fetch('/api/users');
          const users = await res.json();
          const user = users.find(u => u.email === email && u.password === password);
          
          if (user) {
            setSuccess("Berhasil masuk!");
            localStorage.setItem("panus_session", JSON.stringify(user));
            if (onLoginSuccess) onLoginSuccess(user);
          } else {
            setError("Email atau password salah!");
          }
        } catch (err) {
          setError("Gagal menghubungi server untuk masuk.");
        }
      }
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError("");
    setSuccess("");
    setPassword("");
  };

  const changeRole = (newRole) => {
    setRole(newRole);
    setIsRegistering(false); // kembali ke form login tiap ganti role
    setError("");
    setSuccess("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#3A372E] flex flex-col items-center justify-center p-6">
      {/* Elemen dekoratif atas */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#7A5A3A] via-[#9C7B53] to-[#3F6B2E]"></div>

      <div className="w-full max-w-md">
        {/* Header & Logo */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="w-16 h-16 bg-[#EAF1E2] rounded-2xl flex items-center justify-center mb-5 border border-[#BFD8AC] shadow-sm">
            <Sprout size={32} className="text-[#3F6B2E]" />
          </div>
          <h1 className="text-2xl font-bold text-[#2F4A2E] leading-tight mb-2">
            {isRegistering ? "Buat Akun Baru" : "Selamat Datang"}
          </h1>
          <p className="text-sm text-[#6B6354]">
            {isRegistering 
              ? "Daftar untuk mengakses sistem Pangan Nusantara." 
              : "Masuk untuk melanjutkan ke sistem Pangan Nusantara."}
          </p>
        </div>

        {/* Role Selector */}
        {!isRegistering && (
          <div className="flex bg-[#E4DECF]/50 p-1 rounded-xl mb-6 border border-[#E4DECF]">
            <button
              onClick={() => changeRole("user")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === "user"
                  ? "bg-white text-[#3F6B2E] shadow-sm"
                  : "text-[#8A8270] hover:text-[#3A372E]"
              }`}
            >
              <Users size={16} />
              Petani / User
            </button>
            <button
              onClick={() => changeRole("pengelola")}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                role === "pengelola"
                  ? "bg-white text-[#7A5A3A] shadow-sm"
                  : "text-[#8A8270] hover:text-[#3A372E]"
              }`}
            >
              <ShieldCheck size={16} />
              Pengelola
            </button>
          </div>
        )}

        {/* Info Pengelola Default (Opsional, untuk mempermudah tes) */}
        {/* {!isRegistering && role === "pengelola" && (
          <div className="mb-4 p-3 bg-[#F2EFE6] border border-[#E4DECF] rounded-xl text-xs text-[#6B6354] text-center">
            {/* Gunakan email: <strong>admin@panus.com</strong> | password: <strong>admin</strong> */}
          {/* </div> */}
        {/* )} */}

        {/* Card Form */}
        <div className="bg-[#F2EFE6] rounded-3xl border border-[#E4DECF] p-7 md:p-8 relative overflow-hidden shadow-sm">
          <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${role === 'pengelola' ? 'from-[#7A5A3A] to-[#C7AE82]' : 'from-[#3F6B2E] to-[#BFD8AC]'}`} />

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl text-center">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-[#EAF1E2] border border-[#BFD8AC] text-[#2F4A2E] text-sm rounded-xl text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {/* Input Nama (Hanya untuk Register) */}
            {isRegistering && (
              <div>
                <label className="block text-sm font-medium text-[#3A372E] mb-1.5 ml-1">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A39C89]">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masukkan nama Anda"
                    className="w-full pl-10 pr-4 py-3 bg-white/70 border border-[#E4DECF] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3F6B2E]/20 focus:border-[#3F6B2E] transition-all text-sm placeholder-[#A39C89] text-[#3A372E]"
                    required={isRegistering}
                  />
                </div>
              </div>
            )}

            {/* Input Email */}
            <div>
              <label className="block text-sm font-medium text-[#3A372E] mb-1.5 ml-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A39C89]">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email"
                  className={`w-full pl-10 pr-4 py-3 bg-white/70 border border-[#E4DECF] rounded-xl focus:outline-none focus:ring-2 transition-all text-sm placeholder-[#A39C89] text-[#3A372E] ${
                    role === 'pengelola' && !isRegistering 
                      ? 'focus:ring-[#7A5A3A]/20 focus:border-[#7A5A3A]' 
                      : 'focus:ring-[#3F6B2E]/20 focus:border-[#3F6B2E]'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-sm font-medium text-[#3A372E] mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A39C89]">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className={`w-full pl-10 pr-4 py-3 bg-white/70 border border-[#E4DECF] rounded-xl focus:outline-none focus:ring-2 transition-all text-sm placeholder-[#A39C89] text-[#3A372E] ${
                    role === 'pengelola' && !isRegistering 
                      ? 'focus:ring-[#7A5A3A]/20 focus:border-[#7A5A3A]' 
                      : 'focus:ring-[#3F6B2E]/20 focus:border-[#3F6B2E]'
                  }`}
                  required
                />
              </div>
              {!isRegistering && (
                <div className="flex justify-end mt-2">
                  <a
                    href="#"
                    className={`text-xs font-medium hover:underline transition-colors ${
                      role === 'pengelola' ? 'text-[#7A5A3A] hover:text-[#5A4026]' : 'text-[#3F6B2E] hover:text-[#2F4A2E]'
                    }`}
                  >
                    Lupa password?
                  </a>
                </div>
              )}
            </div>

            {/* Tombol Submit */}
            <button
              type="submit"
              className={`w-full inline-flex items-center justify-center gap-2 text-white text-sm font-medium px-6 py-3.5 rounded-xl transition-colors mt-2 ${
                role === 'pengelola' && !isRegistering
                  ? 'bg-[#7A5A3A] hover:bg-[#5A4026]'
                  : 'bg-[#3F6B2E] hover:bg-[#345A26]'
              }`}
            >
              {isRegistering ? "Daftar Sekarang" : "Masuk"}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Navigasi Register / Login (Hanya untuk User) */}
          {role === "user" && (
            <div className="mt-6 text-center text-sm text-[#6B6354]">
              {isRegistering ? (
                <>
                  Sudah punya akun?{" "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="font-semibold text-[#3F6B2E] hover:text-[#2F4A2E] hover:underline transition-colors"
                  >
                    Masuk di sini
                  </button>
                </>
              ) : (
                <>
                  Belum punya akun?{" "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="font-semibold text-[#3F6B2E] hover:text-[#2F4A2E] hover:underline transition-colors"
                  >
                    Daftar di sini
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-[#A39C89]">
            © {new Date().getFullYear()} Pangan Nusantara. Hak Cipta Dilindungi.
          </p>
        </div>
      </div>
    </div>
  );
}
