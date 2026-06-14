<?php

// 1. Matriks Bobot Kriteria untuk 6 Tanaman (Total per tanaman = 1.0)
$bobot_tanaman = [
    "Singkong" => ["suhu" => 0.15, "hujan" => 0.10, "ph" => 0.15, "alt" => 0.15, "drainase" => 0.25, "tekstur" => 0.20],
    "Sorgum"   => ["suhu" => 0.25, "hujan" => 0.15, "ph" => 0.15, "alt" => 0.15, "drainase" => 0.15, "tekstur" => 0.15],
    "Sagu"     => ["suhu" => 0.10, "hujan" => 0.30, "ph" => 0.15, "alt" => 0.10, "drainase" => 0.20, "tekstur" => 0.15],
    "Jelai"    => ["suhu" => 0.15, "hujan" => 0.15, "ph" => 0.15, "alt" => 0.25, "drainase" => 0.15, "tekstur" => 0.15],
    "Talas"    => ["suhu" => 0.10, "hujan" => 0.25, "ph" => 0.15, "alt" => 0.10, "drainase" => 0.20, "tekstur" => 0.20],
    "Jagung"   => ["suhu" => 0.20, "hujan" => 0.20, "ph" => 0.20, "alt" => 0.10, "drainase" => 0.15, "tekstur" => 0.15]
];

// 2. Fungsi Klasifikasi Kesesuaian Lahan
function klasifikasiKesesuaian($skor) {
    if ($skor >= 0.80) return "Sangat Sesuai (S1)";
    if ($skor >= 0.60) return "Cukup Sesuai (S2)";
    if ($skor >= 0.40) return "Sesuai Bersyarat (S3)";
    return "Tidak Sesuai (N)";
}

// 3. Data Kasus: Hasil Fuzzifikasi Lahan (Skala 0 - 1)
// Studi Kasus: Lahan subur, curah hujan tinggi, TAPI genangan air parah (drainase = 0.20)
$lahan_uji = [
    "suhu"     => 0.85, 
    "hujan"    => 0.90, 
    "ph"       => 0.80, 
    "alt"      => 0.70, 
    "drainase" => 0.20, // <-- Faktor Pembatas Liebig (Nilai Paling Kritis)
    "tekstur"  => 0.75 
];

// 4. Proses Perhitungan Fuzzy SAW + Hukum Liebig
$alpha = 0.5; // Keseimbangan 50:50 antara SAW dan Liebig
$hasil_rekomendasi = [];

// Cari faktor pembatas (Nilai Minimum dari Lahan) -> Hukum Liebig
$nilai_minimum_lahan = min($lahan_uji);

foreach ($bobot_tanaman as $nama_tanaman => $bobot) {
    // Hitung V_SAW (Penjumlahan Berbobot)
    $v_saw = 0;
    foreach ($bobot as $parameter => $nilai_bobot) {
        $v_saw += ($nilai_bobot * $lahan_uji[$parameter]);
    }
    
    // Hitung Skor Akhir (Integrasi SAW dan Liebig)
    $skor_akhir = ($alpha * $v_saw) + ((1 - $alpha) * $nilai_minimum_lahan);
    
    // Simpan hasil
    $hasil_rekomendasi[] = [
        "tanaman" => $nama_tanaman,
        "skor"    => round($skor_akhir, 3), // Dibulatkan 3 angka di belakang koma
        "saw"     => round($v_saw, 3),
        "status"  => klasifikasiKesesuaian($skor_akhir)
    ];
}

// 5. Urutkan hasil dari skor tertinggi ke terendah
usort($hasil_rekomendasi, function($a, $b) {
    return $b['skor'] <=> $a['skor'];
});

// 6. Cetak Hasil
echo "=== HASIL ANALISIS KESESUAIAN LAHAN ===\n";
echo "Faktor Pembatas Terburuk (Liebig): " . $nilai_minimum_lahan . " (Drainase)\n\n";

foreach ($hasil_rekomendasi as $index => $hasil) {
    $rank = $index + 1;
    echo "Peringkat {$rank}: {$hasil['tanaman']}\n";
    echo "- Skor Akhir   : {$hasil['skor']} [ {$hasil['status']} ]\n";
    echo "- Skor SAW Murni: {$hasil['saw']}\n";
    echo "----------------------------------------\n";
}

?>