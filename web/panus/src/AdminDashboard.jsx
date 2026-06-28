import { useState, useEffect } from "react";
import { Users, FileText, ChevronRight, Sprout, Calendar, User as UserIcon } from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [histories, setHistories] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data users dan histories dari API lokal kita
    Promise.all([
      fetch('/api/users').then(res => res.json()),
      fetch('/api/history').then(res => res.json())
    ]).then(([usersData, historiesData]) => {
      // Filter hanya role 'user'
      const onlyUsers = usersData.filter(u => u.role === 'user');
      setUsers(onlyUsers);
      setHistories(historiesData);
      setLoading(false);
    }).catch(err => {
      console.error("Gagal mengambil data:", err);
      setLoading(false);
    });
  }, []);

  // Filter histori berdasarkan user yang dipilih
  const userHistories = selectedUser 
    ? histories.filter(h => h.email === selectedUser.email).reverse() // terbaru di atas
    : [];

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#3A372E] p-6 pt-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#2F4A2E] flex items-center gap-3">
            <Users size={32} />
            Dashboard Pengelola
          </h1>
          <p className="text-[#6B6354] mt-2">
            Pantau aktivitas pengguna dan hasil analisis lahan mereka.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#6B6354]">Memuat data...</div>
        ) : (
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Panel Kiri: Daftar User */}
            <div className="w-full md:w-1/3 flex flex-col gap-3">
              <h2 className="text-lg font-semibold text-[#2F4A2E] mb-2 px-1">Daftar Pengguna</h2>
              {users.length === 0 ? (
                <div className="p-6 bg-white/50 border border-[#E4DECF] rounded-2xl text-center text-sm text-[#8A8270]">
                  Belum ada pengguna terdaftar.
                </div>
              ) : (
                users.map((user, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedUser(user)}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                      selectedUser?.email === user.email
                        ? "bg-[#EAF1E2] border-[#BFD8AC]"
                        : "bg-white/70 border-[#E4DECF] hover:bg-white hover:border-[#BFD8AC]"
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`p-2 rounded-full ${selectedUser?.email === user.email ? "bg-[#3F6B2E] text-white" : "bg-[#F2EFE6] text-[#8A8270]"}`}>
                        <UserIcon size={18} />
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-semibold text-[#2F4A2E] truncate">{user.name}</div>
                        <div className="text-xs text-[#6B6354] truncate">{user.email}</div>
                      </div>
                    </div>
                    <ChevronRight size={18} className={selectedUser?.email === user.email ? "text-[#3F6B2E]" : "text-[#A39C89]"} />
                  </button>
                ))
              )}
            </div>

            {/* Panel Kanan: Detail Riwayat */}
            <div className="w-full md:w-2/3">
              <div className="bg-[#F2EFE6] rounded-3xl border border-[#E4DECF] p-6 md:p-8 min-h-[500px]">
                {!selectedUser ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-60">
                    <FileText size={48} className="text-[#A39C89] mb-4" />
                    <p className="text-[#6B6354]">Pilih salah satu pengguna di sebelah kiri<br/>untuk melihat riwayat perhitungannya.</p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-6 pb-4 border-b border-[#E4DECF] flex justify-between items-end">
                      <div>
                        <h2 className="text-2xl font-bold text-[#2F4A2E]">{selectedUser.name}</h2>
                        <p className="text-sm text-[#6B6354]">{selectedUser.email}</p>
                      </div>
                      <div className="text-sm bg-white/70 px-3 py-1.5 rounded-lg border border-[#E4DECF] font-medium text-[#7A5A3A]">
                        Total Analisis: {userHistories.length}
                      </div>
                    </div>

                    {userHistories.length === 0 ? (
                      <div className="text-center py-10 text-[#8A8270] bg-white/40 rounded-2xl border border-dashed border-[#E4DECF]">
                        Pengguna ini belum pernah melakukan analisis lahan.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {userHistories.map((hist, idx) => (
                          <div key={idx} className="bg-white rounded-2xl border border-[#E4DECF] p-5 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-2 text-xs text-[#8A8270] font-medium bg-[#F2EFE6] px-2.5 py-1 rounded-full">
                                <Calendar size={14} />
                                {new Date(hist.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                              </div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row gap-6">
                              {/* Parameter Input */}
                              <div className="flex-1 space-y-2">
                                <p className="text-xs font-semibold text-[#A39C89] uppercase tracking-wide">Parameter Input</p>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div className="bg-[#FAF7F0] p-2 rounded-lg border border-[#E4DECF]">
                                    <span className="text-[#8A8270] text-xs block">Suhu</span>
                                    <span className="font-semibold text-[#3A372E]">{hist.inputs.suhu}°C</span>
                                  </div>
                                  <div className="bg-[#FAF7F0] p-2 rounded-lg border border-[#E4DECF]">
                                    <span className="text-[#8A8270] text-xs block">Curah Hujan</span>
                                    <span className="font-semibold text-[#3A372E]">{hist.inputs.hujan} mm</span>
                                  </div>
                                  <div className="bg-[#FAF7F0] p-2 rounded-lg border border-[#E4DECF]">
                                    <span className="text-[#8A8270] text-xs block">pH Tanah</span>
                                    <span className="font-semibold text-[#3A372E]">{hist.inputs.ph}</span>
                                  </div>
                                  <div className="bg-[#FAF7F0] p-2 rounded-lg border border-[#E4DECF]">
                                    <span className="text-[#8A8270] text-xs block">Ketinggian</span>
                                    <span className="font-semibold text-[#3A372E]">{hist.inputs.tinggi} mdpl</span>
                                  </div>
                                </div>
                              </div>

                              {/* Hasil Rekomendasi (Semua Tanaman) */}
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-[#A39C89] uppercase tracking-wide mb-2">Hasil Kesesuaian Tanaman</p>
                                <div className="space-y-2">
                                  {(hist.results || (hist.topResult ? [hist.topResult] : [])).map((res, i) => (
                                    <div key={res.id} className={`p-2.5 rounded-xl border flex justify-between items-center ${i === 0 ? 'bg-[#EAF1E2] border-[#BFD8AC]' : 'bg-[#FAF7F0] border-[#E4DECF]'}`}>
                                      <div className="flex items-center gap-2.5">
                                        <div className={`p-1.5 rounded-lg ${i === 0 ? 'bg-[#3F6B2E] text-white' : 'bg-[#F2EFE6] text-[#8A8270]'}`}>
                                          <Sprout size={16} />
                                        </div>
                                        <div>
                                          <div className={`font-bold capitalize text-sm ${i === 0 ? 'text-[#2F4A2E]' : 'text-[#3A372E]'}`}>
                                            {res.id}
                                          </div>
                                          {i === 0 && <div className="text-[10px] font-semibold text-[#3F6B2E] uppercase">Rekomendasi Utama</div>}
                                        </div>
                                      </div>
                                      <div className={`text-sm font-bold ${i === 0 ? 'text-[#3F6B2E]' : 'text-[#8A8270]'}`}>
                                        {res.persentase.toFixed(1)}%
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
          </div>
        )}
      </div>
    </div>
  );
}
