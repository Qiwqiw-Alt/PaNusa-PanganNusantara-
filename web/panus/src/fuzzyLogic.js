// fuzzyLogic.js
// Konversi dari FuzzyMamdaniTanamanPangan (Python) ke JavaScript.
// Rule base 81 aturan/tanaman diambil LANGSUNG dari
// "_Rule Base Mamdani (2).xlsx" (sama persis seperti yang dibaca kode
// Python), bukan digenerate dari Hukum Liebig murni — karena rule base
// asli punya beberapa pengecualian manual berdasarkan karakteristik
// khusus tiap tanaman (lihat RULE_BASE di bawah).

// ---------- Fungsi keanggotaan dasar ----------

export function trimf(x, a, b, c) {
  if (x <= a || x >= c) return 0.0;
  if (x <= b) return b - a !== 0 ? (x - a) / (b - a) : 0.0;
  return c - b !== 0 ? (c - x) / (c - b) : 0.0;
}

export function trapmf(x, [a, b, c, d]) {
  if (x <= a || x >= d) return 0.0;
  if (x >= b && x <= c) return 1.0;
  if (x > a && x < b) return b - a !== 0 ? (x - a) / (b - a) : 0.0;
  return d - c !== 0 ? (d - x) / (d - c) : 0.0;
}

// Derajat keanggotaan linguistik (rendah/sedang/tinggi) untuk satu variabel input.
// param = [optimalMin, optimalMaxAwal?, ...] mengikuti format python:
// [a, b, c, d] dengan a/d = absolute min/max, b/c = optimal min/max.
// Kasus khusus ketinggian: a === 0 && b === 0 -> hanya naik turun (tidak ada sisi "rendah suhu rendah").
export function getDerajatLinguistik(x, param) {
  const [p0, p1, p2, p3] = param;

  if (p0 === 0 && p1 === 0) {
    // Kasus Ketinggian Tempat
    const tinggi = trapmf(x, [0, 0, p2, p2]);
    const sedang = trimf(x, p2, p3, p3);
    const rendah = x >= p3 ? 1.0 : 0.0;
    return { rendah, sedang, tinggi };
  }

  let tinggi = trapmf(x, [p1, p1, p2, p2]);
  const sedangBawah = trimf(x, p0, p0, p1);
  const sedangAtas = trimf(x, p2, p3, p3);
  let sedang = Math.max(sedangBawah, sedangAtas);
  let rendah;

  if (x <= p0 || x >= p3) {
    rendah = 1.0;
    sedang = 0.0;
    tinggi = 0.0;
  } else {
    rendah = Math.max(0.0, Math.min(1.0, 1.0 - (tinggi + sedang)));
  }

  return { rendah, sedang, tinggi };
}

// ---------- Basis pengetahuan (Ecocrop, lihat dokumen Pangan Nusantara) ----------
// Format tiap variabel: [absoluteMin, optimalMin, optimalMax, absoluteMax]

export const basisPengetahuan = {
  sorgum: {
    suhu: [8, 22, 35, 40],
    hujan: [300, 400, 600, 700],
    ph: [5.0, 5.5, 7.5, 8.0],
    tinggi: [0, 0, 2250, 2500],
  },
  sagu: {
    suhu: [18, 25, 36, 40],
    hujan: [2100, 3000, 4500, 5800],
    ph: [4.5, 5.5, 6.5, 8.5],
    tinggi: [0, 0, 630, 700],
  },
  gembili: {
    suhu: [17, 28, 32, 45],
    hujan: [600, 800, 2000, 8000],
    ph: [4.5, 5.5, 6.5, 8.5],
    tinggi: [0, 0, 810, 900],
  },
  jelai: {
    suhu: [2, 15, 20, 40],
    hujan: [200, 500, 1000, 2000],
    ph: [6.0, 6.5, 7.5, 8.0],
    tinggi: [0, 0, 3960, 4400],
  },
  talas: {
    suhu: [10, 21, 28, 35],
    hujan: [1000, 1800, 2700, 4100],
    ph: [4.3, 5.5, 6.5, 8.2],
    tinggi: [0, 0, 2430, 2700],
  },
};

// ---------- Membership fungsi output (universe 0-100, "kecocokan %") ----------

function mfOutputRendah(x) {
  return trapmf(x, [0, 0, 25, 50]);
}
function mfOutputSedang(x) {
  return trimf(x, 25, 50, 75);
}
function mfOutputTinggi(x) {
  return trapmf(x, [50, 75, 100, 100]);
}

// ---------- Rule base asli (dari _Rule Base Mamdani (2).xlsx) ----------
// Setiap string 5 karakter = [Suhu][Hujan][pH][Ketinggian][Output]
// R = Rendah, S = Sedang, T = Tinggi.
// Sebagian besar baris memang murni Hukum Minimum Liebig (output = level
// terendah dari 4 input), TAPI ada pengecualian manual di beberapa baris
// per tanaman (mis. 3 faktor "Tinggi" + 1 faktor "Sedang" -> tetap
// "SEDANG", bukan dijatuhkan sesuai faktor pembatas murni). Tabel di
// bawah ini sudah termasuk semua pengecualian tersebut, sama persis
// dengan yang dibaca kode Python dari Excel.

const LEVEL_CODE = { R: "rendah", S: "sedang", T: "tinggi" };
const OUTPUT_CODE = { R: "RENDAH", S: "SEDANG", T: "TINGGI" };

const RULE_BASE_RAW = {
  sorgum: [
    "TTTTT","TTTSS","TTTRR","TTSTS","TTSSS","TTSRR","TTRTR","TTRSR","TTRRR",
    "TSTTT","TSTSS","TSTRR","TSSTS","TSSSS","TSSRR","TSRTR","TSRSR","TSRRR",
    "TRTTR","TRTSR","TRTRR","TRSTR","TRSSR","TRSRR","TRRTR","TRRSR","TRRRR",
    "STTTS","STTSS","STTRR","STSTS","STSSS","STSRR","STRTR","STRSR","STRRR",
    "SSTTS","SSTSS","SSTRR","SSSTS","SSSSR","SSSRR","SSRTR","SSRSR","SSRRR",
    "SRTTR","SRTSR","SRTRR","SRSTR","SRSSR","SRSRR","SRRTR","SRRSR","SRRRR",
    "RTTTR","RTTSR","RTTRR","RTSTR","RTSSR","RTSRR","RTRTR","RTRSR","RTRRR",
    "RSTTR","RSTSR","RSTRR","RSSTR","RSSSR","RSSRR","RSRTR","RSRSR","RSRRR",
    "RRTTR","RRTSR","RRTRR","RRSTR","RRSSR","RRSRR","RRRTR","RRRSR","RRRRR",
  ],
  sagu: [
    "TTTTT","TTTSR","TTTRR","TTSTT","TTSSR","TTSRR","TTRTR","TTRSR","TTRRR",
    "TSTTS","TSTSR","TSTRR","TSSTS","TSSSR","TSSRR","TSRTR","TSRSR","TSRRR",
    "TRTTR","TRTSR","TRTRR","TRSTR","TRSSR","TRSRR","TRRTR","TRRSR","TRRRR",
    "STTTS","STTSR","STTRR","STSTS","STSSR","STSRR","STRTR","STRSR","STRRR",
    "SSTTS","SSTSR","SSTRR","SSSTS","SSSSR","SSSRR","SSRTR","SSRSR","SSRRR",
    "SRTTR","SRTSR","SRTRR","SRSTR","SRSSR","SRSRR","SRRTR","SRRSR","SRRRR",
    "RTTTR","RTTSR","RTTRR","RTSTR","RTSSR","RTSRR","RTRTR","RTRSR","RTRRR",
    "RSTTR","RSTSR","RSTRR","RSSTR","RSSSR","RSSRR","RSRTR","RSRSR","RSRRR",
    "RRTTR","RRTSR","RRTRR","RRSTR","RRSSR","RRSRR","RRRTR","RRRSR","RRRRR",
  ],
  gembili: [
    "TTTTT","TTTSS","TTTRR","TTSTS","TTSSS","TTSRR","TTRTR","TTRSR","TTRRR",
    "TSTTT","TSTSS","TSTRR","TSSTS","TSSSS","TSSRR","TSRTR","TSRSR","TSRRR",
    "TRTTR","TRTSR","TRTRR","TRSTR","TRSSR","TRSRR","TRRTR","TRRSR","TRRRR",
    "STTTS","STTSS","STTRR","STSTS","STSSS","STSRR","STRTR","STRSR","STRRR",
    "SSTTS","SSTSS","SSTRR","SSSTS","SSSSR","SSSRR","SSRTR","SSRSR","SSRRR",
    "SRTTR","SRTSR","SRTRR","SRSTR","SRSSR","SRSRR","SRRTR","SRRSR","SRRRR",
    "RTTTR","RTTSR","RTTRR","RTSTR","RTSSR","RTSRR","RTRTR","RTRSR","RTRRR",
    "RSTTR","RSTSR","RSTRR","RSSTR","RSSSR","RSSRR","RSRTR","RSRSR","RSRRR",
    "RRTTR","RRTSR","RRTRR","RRSTR","RRSSR","RRSRR","RRRTR","RRRSR","RRRRR",
  ],
  jelai: [
    "TTTTT","TTTST","TTTRR","TTSTT","TTSSS","TTSRR","TTRTR","TTRSR","TTRRR",
    "TSTTT","TSTSS","TSTRR","TSSTS","TSSSS","TSSRR","TSRTR","TSRSR","TSRRR",
    "TRTTR","TRTSR","TRTRR","TRSTR","TRSSR","TRSRR","TRRTR","TRRSR","TRRRR",
    "STTTT","STTSS","STTRR","STSTS","STSSS","STSRR","STRTR","STRSR","STRRR",
    "SSTTS","SSTSS","SSTRR","SSSTS","SSSSR","SSSRR","SSRTR","SSRSR","SSRRR",
    "SRTTR","SRTSR","SRTRR","SRSTR","SRSSR","SRSRR","SRRTR","SRRSR","SRRRR",
    "RTTTR","RTTSR","RTTRR","RTSTR","RTSSR","RTSRR","RTRTR","RTRSR","RTRRR",
    "RSTTR","RSTSR","RSTRR","RSSTR","RSSSR","RSSRR","RSRTR","RSRSR","RSRRR",
    "RRTTR","RRTSR","RRTRR","RRSTR","RRSSR","RRSRR","RRRTR","RRRSR","RRRRR",
  ],
  talas: [
    "TTTTT","TTTST","TTTRR","TTSTT","TTSSS","TTSRR","TTRTR","TTRSR","TTRRR",
    "TSTTT","TSTSS","TSTRR","TSSTS","TSSSS","TSSRR","TSRTR","TSRSR","TSRRR",
    "TRTTR","TRTSR","TRTRR","TRSTR","TRSSR","TRSRR","TRRTR","TRRSR","TRRRR",
    "STTTT","STTSS","STTRR","STSTS","STSSS","STSRR","STRTR","STRSR","STRRR",
    "SSTTS","SSTSS","SSTRR","SSSTS","SSSSS","SSSRR","SSRTR","SSRSR","SSRRR",
    "SRTTR","SRTSR","SRTRR","SRSTR","SRSSR","SRSRR","SRRTR","SRRSR","SRRRR",
    "RTTTR","RTTSR","RTTRR","RTSTR","RTSSR","RTSRR","RTRTR","RTRSR","RTRRR",
    "RSTTR","RSTSR","RSTRR","RSSTR","RSSSR","RSSRR","RSRTR","RSRSR","RSRRR",
    "RRTTR","RRTSR","RRTRR","RRSTR","RRSSR","RRSRR","RRRTR","RRRSR","RRRRR",
  ],
};

// Parse string ringkas -> { suhu, hujan, ph, ketinggian, output }
function parseRuleBase(rawMap) {
  const parsed = {};
  for (const [tanaman, rows] of Object.entries(rawMap)) {
    parsed[tanaman] = rows.map((r) => ({
      suhu: LEVEL_CODE[r[0]],
      hujan: LEVEL_CODE[r[1]],
      ph: LEVEL_CODE[r[2]],
      ketinggian: LEVEL_CODE[r[3]],
      output: OUTPUT_CODE[r[4]],
    }));
  }
  return parsed;
}

export const ruleBase = parseRuleBase(RULE_BASE_RAW);

// ---------- Inferensi fuzzy (Mamdani, max-min) ----------

export function fuzzyInference(suhu, hujan, ph, tinggi) {
  const activationRules = {};

  for (const [tanaman, param] of Object.entries(basisPengetahuan)) {
    const fSuhu = getDerajatLinguistik(suhu, param.suhu);
    const fHujan = getDerajatLinguistik(hujan, param.hujan);
    const fPh = getDerajatLinguistik(ph, param.ph);
    const fTinggi = getDerajatLinguistik(tinggi, param.tinggi);

    let skorRendah = 0.0;
    let skorSedang = 0.0;
    let skorTinggi = 0.0;

    const rules = ruleBase[tanaman] || [];
    for (const rule of rules) {
      const alpha = Math.min(
        fSuhu[rule.suhu] ?? 0,
        fHujan[rule.hujan] ?? 0,
        fPh[rule.ph] ?? 0,
        fTinggi[rule.ketinggian] ?? 0
      );
      if (alpha <= 0) continue;

      if (rule.output === "RENDAH") skorRendah = Math.max(skorRendah, alpha);
      else if (rule.output === "SEDANG") skorSedang = Math.max(skorSedang, alpha);
      else if (rule.output === "TINGGI") skorTinggi = Math.max(skorTinggi, alpha);
    }

    activationRules[tanaman] = {
      rendah: skorRendah,
      sedang: skorSedang,
      tinggi: skorTinggi,
    };
  }

  return activationRules;
}

// ---------- Defuzzifikasi: Center of Gravity (centroid) ----------

const OUTPUT_MIN = 0.0;
const OUTPUT_MAX = 100.0;
const OUTPUT_STEPS = 101;

export function defuzzifyCOG(activationDict) {
  const results = {};

  for (const [tanaman, levels] of Object.entries(activationDict)) {
    let numerator = 0.0;
    let denominator = 0.0;

    for (let i = 0; i < OUTPUT_STEPS; i++) {
      const x = OUTPUT_MIN + (i * (OUTPUT_MAX - OUTPUT_MIN)) / (OUTPUT_STEPS - 1);
      const combined = Math.max(
        Math.min(levels.rendah, mfOutputRendah(x)),
        Math.min(levels.sedang, mfOutputSedang(x)),
        Math.min(levels.tinggi, mfOutputTinggi(x))
      );
      numerator += x * combined;
      denominator += combined;
    }

    results[tanaman] = denominator !== 0 ? numerator / denominator : 0.0;
  }

  return results;
}

// ---------- API utama ----------

/**
 * Menghitung kecocokan lahan untuk semua tanaman, sudah diurutkan dari
 * yang paling cocok.
 * @returns {Array<{id: string, persentase: number}>}
 */
export function hitungKesesuaianLahan(suhu, hujan, ph, tinggi) {
  const activation = fuzzyInference(suhu, hujan, ph, tinggi);
  const hasil = defuzzifyCOG(activation);

  return Object.entries(hasil)
    .map(([id, persentase]) => ({ id, persentase }))
    .sort((a, b) => b.persentase - a.persentase);
}

/**
 * Derajat keanggotaan (rendah/sedang/tinggi) tiap variabel input untuk satu
 * tanaman tertentu. Berguna untuk menampilkan faktor mana yang jadi
 * pembatas (sesuai Hukum Minimum Liebig) di UI.
 */
export function getDerajatFaktor(suhu, hujan, ph, tinggi, tanamanId) {
  const param = basisPengetahuan[tanamanId];
  if (!param) return null;

  return {
    suhu: getDerajatLinguistik(suhu, param.suhu),
    hujan: getDerajatLinguistik(hujan, param.hujan),
    ph: getDerajatLinguistik(ph, param.ph),
    tinggi: getDerajatLinguistik(tinggi, param.tinggi),
  };
}