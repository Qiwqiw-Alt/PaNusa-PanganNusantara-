// ─── DATA TANAMAN ────────────────────────────────────────────────────────────
export const CROPS = {
  Sorgum: {
    latin: "Sorghum bicolor",
    desc: "Sangat cocok untuk lahan kering dan suhu hangat. Ketahanan tinggi terhadap perubahan iklim dan efisiensi penggunaan air yang luar biasa.",
    suhu: { optMin: 22, optMax: 35, absMin: 8, absMax: 40 },
    hujan: { optMin: 400, optMax: 600, absMin: 300, absMax: 700 },
    ph: { optMin: 5.5, optMax: 7.5, absMin: 5, absMax: 8 },
    alt: { optMin: 0, optMax: 2250, absMin: 0, absMax: 2500 },
  },
  Sagu: {
    latin: "Metroxylon sagu",
    desc: "Tumbuh optimal di lahan basah, rawa-rawa, dan dataran rendah. Sangat produktif di lingkungan lembab dengan curah hujan tinggi.",
    suhu: { optMin: 25, optMax: 36, absMin: 18, absMax: 40 },
    hujan: { optMin: 3000, optMax: 4500, absMin: 2100, absMax: 5800 },
    ph: { optMin: 5.5, optMax: 6.5, absMin: 4.5, absMax: 8.5 },
    alt: { optMin: 0, optMax: 630, absMin: 0, absMax: 700 },
  },
  Gembili: {
    latin: "Dioscorea esculenta",
    desc: "Adaptif dengan musim kemarau melalui dormansi umbi. Membutuhkan tanah gembur yang tidak tergenang untuk perkembangan umbi optimal.",
    suhu: { optMin: 28, optMax: 32, absMin: 17, absMax: 45 },
    hujan: { optMin: 800, optMax: 2000, absMin: 600, absMax: 8000 },
    ph: { optMin: 5.5, optMax: 6.5, absMin: 4.5, absMax: 8.5 },
    alt: { optMin: 0, optMax: 810, absMin: 0, absMax: 900 },
  },
  Jelai: {
    latin: "Hordeum vulgare",
    desc: "Adaptif di dataran tinggi tropis dengan suhu sejuk. Siklus tumbuh singkat dan toleran kekeringan.",
    suhu: { optMin: 15, optMax: 20, absMin: 2, absMax: 40 },
    hujan: { optMin: 500, optMax: 1000, absMin: 200, absMax: 2000 },
    ph: { optMin: 6.5, optMax: 7.5, absMin: 6, absMax: 8 },
    alt: { optMin: 0, optMax: 3960, absMin: 0, absMax: 4400 },
  },
  Talas: {
    latin: "Colocasia esculenta",
    desc: "Membutuhkan kelembaban tanah yang konsisten. Potensi hasil tinggi pada lahan subur, toleran terhadap tanah masam.",
    suhu: { optMin: 21, optMax: 28, absMin: 10, absMax: 35 },
    hujan: { optMin: 1800, optMax: 2700, absMin: 1000, absMax: 4100 },
    ph: { optMin: 5.5, optMax: 6.5, absMin: 4.3, absMax: 8.2 },
    alt: { optMin: 0, optMax: 2430, absMin: 0, absMax: 2700 },
  },
};

// ─── FUZZY LOGIC ENGINE ───────────────────────────────────────────────────────

/** Fungsi keanggotaan trapesium */
export function trapMF(x, a, b, c, d) {
  if (x <= a || x >= d) return 0;
  if (x >= b && x <= c) return 1;
  if (x > a && x < b) return (x - a) / (b - a);
  if (x > c && x < d) return (d - x) / (d - c);
  return 0;
}

/**
 * Fuzzifikasi satu variabel menjadi 3 himpunan: low, med, high
 * Menggunakan parameter absMin/optMin/optMax/absMax dari data tanaman
 */
export function fuzzifyVar(val, p) {
  const eps = 0.001;
  // LOW  : absMin → absMin → optMin → optMin  (transisi naik dari absMin ke optMin)
  const low = trapMF(val, p.absMin - eps, p.absMin, p.absMin, p.optMin);
  // MED  : absMin → optMin → optMax → absMax  (zona optimal penuh = 1.0)
  const med = trapMF(val, p.absMin, p.optMin, p.optMax, p.absMax);
  // HIGH : optMax → absMax → absMax → absMax  (transisi turun dari optMax ke absMax)
  const high = trapMF(val, p.optMax, p.absMax, p.absMax, p.absMax + eps);
  return { low, med, high };
}

/**
 * Inferensi Mamdani — 81 rules (3^4 kombinasi) per tanaman
 * Output: bobot kesesuaian 0–1 via metode MAX-MIN
 * Rule: IF suhu=X AND hujan=Y AND ph=Z AND alt=W THEN output=f(X,Y,Z,W)
 * Bobot output: med=1.0, low/high=0.3 (suboptimal tapi masih bisa tumbuh)
 */
export function inferMamdani(suhu, hujan, ph, alt, cropKey) {
  const crop = CROPS[cropKey];
  const fS = fuzzifyVar(suhu, crop.suhu);
  const fH = fuzzifyVar(hujan, crop.hujan);
  const fP = fuzzifyVar(ph, crop.ph);
  const fA = fuzzifyVar(alt, crop.alt);

  const sets = ["low", "med", "high"];
  const weight = { low: 0.3, med: 1.0, high: 0.3 };

  let aggregated = 0;
  for (const s of sets) {
    for (const h of sets) {
      for (const p of sets) {
        for (const a of sets) {
          // MIN: kekuatan rule = minimum derajat keanggotaan semua antecedent
          const fireStrength = Math.min(fS[s], fH[h], fP[p], fA[a]);
          if (fireStrength <= 0) continue;

          // Output rule: rata-rata bobot ke-4 variabel
          const outputLevel = Math.min(weight[s], weight[h], weight[p], weight[a]);

          // MAX: agregasi — ambil nilai tertinggi dari semua rule yang terpicu
          aggregated = Math.max(aggregated, fireStrength * outputLevel);
        }
      }
    }
  }

  // Konversi ke persentase 0–100
  return Math.round(aggregated * 100);
}

/** Jalankan inferensi untuk semua tanaman, kembalikan hasil terurut */
export function analyzeAll(suhu, hujan, ph, alt) {
  return Object.keys(CROPS)
    .map((key) => ({ key, score: inferMamdani(suhu, hujan, ph, alt, key) }))
    .sort((a, b) => b.score - a.score);
}
