// LandSuitabilityAnalyzer.jsx
// Komponen tampilan untuk "Pangan Nusantara" — analisis kesesuaian lahan
// pangan lokal berbasis fuzzy Mamdani. Logic ada di fuzzyLogic.js.
//
// Cara pakai di App.jsx:
//   import LandSuitabilityAnalyzer from './LandSuitabilityAnalyzer';
//   export default function App() {
//     return <LandSuitabilityAnalyzer />;
//   }

import { useState } from "react";
import {
  Sprout,
  Thermometer,
  CloudRain,
  FlaskConical,
  Mountain,
  ArrowRight,
  SlidersHorizontal,
} from "lucide-react";
import { hitungKesesuaianLahan, getDerajatFaktor } from "./fuzzyLogic";

const CROP_INFO = {
  sorgum: {
    nama: "Sorgum",
    latin: "Sorghum bicolor",
    deskripsi:
      "Sangat cocok untuk lahan kering dan suhu hangat. Memiliki ketahanan tinggi terhadap kekeringan dan efisiensi penggunaan air yang luar biasa.",
  },
  sagu: {
    nama: "Sagu",
    latin: "Metroxylon sagu",
    deskripsi:
      "Tumbuh optimal di lahan basah, rawa, dan dataran rendah dengan curah hujan tinggi sepanjang tahun.",
  },
  gembili: {
    nama: "Gembili",
    latin: "Dioscorea esculenta",
    deskripsi:
      "Umbi yang tahan terhadap musim kemarau panjang lewat fase dormansi, namun sensitif terhadap suhu dingin dan tanah tergenang.",
  },
  jelai: {
    nama: "Jelai",
    latin: "Hordeum vulgare",
    deskripsi:
      "Adaptif di dataran tinggi dengan suhu sejuk. Memiliki siklus tumbuh yang relatif singkat dan toleran kekeringan.",
  },
  talas: {
    nama: "Talas",
    latin: "Colocasia esculenta",
    deskripsi:
      "Membutuhkan kelembapan tanah yang konsisten. Potensi hasil tinggi pada lahan subur dan toleran terhadap tanah masam.",
  },
};

const FAKTOR_LABEL = [
  { key: "suhu", label: "Suhu", icon: Thermometer },
  { key: "hujan", label: "Curah Hujan", icon: CloudRain },
  { key: "ph", label: "pH Tanah", icon: FlaskConical },
  { key: "tinggi", label: "Ketinggian", icon: Mountain },
];

function CircularGauge({ percentage, size = 128, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percentage));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#E4DECF"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#3F6B2E"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[#2F4A2E]">
          {clamped.toFixed(0)}%
        </span>
        <span className="text-[11px] text-[#6B6354]">Kecocokan</span>
      </div>
    </div>
  );
}

function Slider({ icon: Icon, label, value, min, max, step, unit, onChange }) {
  return (
    <div className="bg-white/70 rounded-2xl border border-[#E4DECF] p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-[#3F6B2E]">
          <Icon size={18} strokeWidth={2} />
          <span className="text-sm font-medium text-[#3A372E]">{label}</span>
        </div>
        <span className="text-sm font-semibold text-[#2F4A2E]">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 rounded-full appearance-none bg-[#E4DECF] accent-[#3F6B2E] cursor-pointer"
      />
      <div className="flex justify-between text-[11px] text-[#A39C89] mt-1">
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

function FaktorBadge({ label, icon: Icon, derajat }) {
  const cocok = derajat?.tinggi >= 0.5;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
        cocok
          ? "bg-[#EAF1E2] border-[#BFD8AC] text-[#3F6B2E]"
          : "bg-[#F2EFE6] border-[#E4DECF] text-[#8A8270]"
      }`}
    >
      <Icon size={12} strokeWidth={2.5} />
      {label}
    </span>
  );
}

export default function LandSuitabilityAnalyzer({ userSession }) {
  const [suhu, setSuhu] = useState(25);
  const [hujan, setHujan] = useState(1200);
  const [ph, setPh] = useState(6.5);
  const [tinggi, setTinggi] = useState(500);
  const [hasil, setHasil] = useState(null);

  const handleAnalisis = async () => {
    const ranking = hitungKesesuaianLahan(suhu, hujan, ph, tinggi);
    setHasil(ranking);

    // Simpan history ke API jika ada sesi user
    if (userSession && userSession.email) {
      try {
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userSession.email,
            inputs: { suhu, hujan, ph, tinggi },
            results: ranking // Menyimpan semua urutan tanaman
          })
        });
      } catch (err) {
        console.error("Gagal menyimpan riwayat:", err);
      }
    }
  };

  const handleReset = () => setHasil(null);

  const topId = hasil?.[0]?.id;
  const topDerajat = topId
    ? getDerajatFaktor(suhu, hujan, ph, tinggi, topId)
    : null;

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#3A372E]">
      {/* Navbar */}
      <header className="border-b border-[#E4DECF]">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-[#2F4A2E]">
            <Sprout size={20} />
            Pangan Nusantara
          </div>
          <span className="text-xs text-[#A39C89]">
            Analisis kesesuaian lahan berbasis fuzzy Mamdani
          </span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <section className="grid md:grid-cols-2 gap-8 items-center mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#2F4A2E] leading-tight mb-3">
              Lahan yang tepat,
              <br />
              pangan yang kuat.
            </h1>
            <p className="text-[#6B6354] text-sm leading-relaxed">
              Gunakan kecerdasan data agronomi untuk memetakan kecocokan
              tanaman pangan lokal dengan karakteristik tanah dan iklim lahan
              Anda secara presisi.
            </p>
          </div>
          <div className="h-40 rounded-2xl bg-gradient-to-b from-[#7A5A3A] via-[#9C7B53] to-[#C7AE82] border border-[#E4DECF]" />
        </section>

        {/* Input */}
        <section className="bg-[#F2EFE6] rounded-3xl border border-[#E4DECF] p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 text-[#3F6B2E] mb-1">
              <SlidersHorizontal size={16} />
              <h2 className="font-semibold">Kondisi Lahanmu</h2>
            </div>
            <p className="text-xs text-[#A39C89]">
              Geser slider untuk menyesuaikan parameter lingkungan Anda.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <Slider
              icon={Thermometer}
              label="Suhu Udara"
              value={suhu}
              min={15}
              max={50}
              step={0.5}
              unit="°C"
              onChange={setSuhu}
            />
            <Slider
              icon={CloudRain}
              label="Curah Hujan"
              value={hujan}
              min={200}
              max={4000}
              step={50}
              unit="mm"
              onChange={setHujan}
            />
            <Slider
              icon={FlaskConical}
              label="pH Tanah"
              value={ph}
              min={3.5}
              max={9.0}
              step={0.1}
              unit=""
              onChange={setPh}
            />
            <Slider
              icon={Mountain}
              label="Ketinggian"
              value={tinggi}
              min={0}
              max={3000}
              step={10}
              unit=" mdpl"
              onChange={setTinggi}
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleAnalisis}
              className="inline-flex items-center gap-2 bg-[#3F6B2E] hover:bg-[#345A26] text-white text-sm font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Analisis Lahan Saya
              <ArrowRight size={16} />
            </button>
          </div>
        </section>

        {/* Hasil */}
        {hasil && (
          <section className="mt-10">
            <p className="text-xs font-semibold tracking-wide text-[#6B6354] uppercase mb-1">
              Analisis Selesai
            </p>
            <h2 className="text-2xl font-bold text-[#2F4A2E] mb-2">
              Hasil Analisis Lahan Anda
            </h2>
            <p className="text-sm text-[#6B6354] mb-6 max-w-2xl">
              Berdasarkan data parameter yang Anda masukkan, berikut adalah
              rekomendasi komoditas pangan yang paling optimal untuk
              ekosistem lahan Anda.
            </p>

            {/* Rekomendasi utama */}
            <div className="bg-[#EAF1E2] border border-[#BFD8AC] rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6 mb-4">
              <CircularGauge percentage={hasil[0].persentase} />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-lg font-bold text-[#2F4A2E]">
                    {CROP_INFO[hasil[0].id].nama} (
                    <span className="italic">
                      {CROP_INFO[hasil[0].id].latin}
                    </span>
                    )
                  </h3>
                  <span className="text-[11px] font-semibold bg-[#3F6B2E] text-white px-2 py-0.5 rounded-full">
                    Rekomendasi Utama
                  </span>
                </div>
                <p className="text-sm text-[#6B6354] mb-3">
                  {CROP_INFO[hasil[0].id].deskripsi}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {FAKTOR_LABEL.map(({ key, label, icon }) => (
                    <FaktorBadge
                      key={key}
                      label={label}
                      icon={icon}
                      derajat={topDerajat?.[key]}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Rank 2-5 */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {hasil.slice(1).map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white/70 border border-[#E4DECF] rounded-2xl p-4 flex flex-col items-center text-center"
                >
                  <CircularGauge percentage={item.persentase} size={80} strokeWidth={7} />
                  <h4 className="font-semibold text-[#2F4A2E] mt-3">
                    {CROP_INFO[item.id].nama}
                  </h4>
                  <p className="text-[11px] text-[#A39C89] italic mb-1">
                    {CROP_INFO[item.id].latin}
                  </p>
                  <p className="text-xs text-[#6B6354] mb-2 line-clamp-3">
                    {CROP_INFO[item.id].deskripsi}
                  </p>
                  <span className="text-[11px] bg-[#F2EFE6] text-[#8A8270] px-2 py-0.5 rounded-full">
                    Rank #{idx + 2}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col items-center mt-8">
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 border border-[#3F6B2E] text-[#3F6B2E] hover:bg-[#EAF1E2] text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
              >
                <SlidersHorizontal size={15} />
                Coba Parameter Lain
              </button>
              <p className="text-[11px] text-[#A39C89] mt-2">
                Analisis ini bersifat saran berdasarkan model agronomis
                fuzzy Mamdani &amp; Hukum Minimum Liebig.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
