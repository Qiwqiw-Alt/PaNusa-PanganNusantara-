<?php

$result = null;

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $tanaman = $_POST['tanaman'];

    $suhu      = floatval($_POST['suhu']);
    $hujan     = floatval($_POST['hujan']);
    $ph        = floatval($_POST['ph']);
    $alt       = floatval($_POST['alt']);
    $drainase  = floatval($_POST['drainase']);
    $tekstur   = floatval($_POST['tekstur']);

    $alpha = 0.5;

    $bobotTanaman = [

        "Singkong" => [
            "suhu"=>0.15,
            "hujan"=>0.10,
            "ph"=>0.15,
            "alt"=>0.15,
            "drainase"=>0.25,
            "tekstur"=>0.20
        ],

        "Sorgum" => [
            "suhu"=>0.25,
            "hujan"=>0.15,
            "ph"=>0.15,
            "alt"=>0.15,
            "drainase"=>0.15,
            "tekstur"=>0.15
        ],

        "Sagu" => [
            "suhu"=>0.10,
            "hujan"=>0.30,
            "ph"=>0.15,
            "alt"=>0.10,
            "drainase"=>0.20,
            "tekstur"=>0.15
        ],

        "Jelai" => [
            "suhu"=>0.15,
            "hujan"=>0.15,
            "ph"=>0.15,
            "alt"=>0.25,
            "drainase"=>0.15,
            "tekstur"=>0.15
        ],

        "Talas" => [
            "suhu"=>0.10,
            "hujan"=>0.25,
            "ph"=>0.15,
            "alt"=>0.10,
            "drainase"=>0.20,
            "tekstur"=>0.20
        ],

        "Jagung" => [
            "suhu"=>0.20,
            "hujan"=>0.20,
            "ph"=>0.20,
            "alt"=>0.10,
            "drainase"=>0.15,
            "tekstur"=>0.15
        ]
    ];

    $bobot = $bobotTanaman[$tanaman];

    // Fuzzy SAW
    $nilaiSAW =
        ($suhu * $bobot['suhu']) +
        ($hujan * $bobot['hujan']) +
        ($ph * $bobot['ph']) +
        ($alt * $bobot['alt']) +
        ($drainase * $bobot['drainase']) +
        ($tekstur * $bobot['tekstur']);

    // Hukum Minimum Liebig
    $nilaiMinimum = min([
        $suhu,
        $hujan,
        $ph,
        $alt,
        $drainase,
        $tekstur
    ]);

    // Skor Akhir
    $skorAkhir = ($alpha * $nilaiSAW) + ($alpha * $nilaiMinimum);

    // Kategori
    if ($skorAkhir >= 0.80) {
        $status = "Sangat Sesuai (S1)";
        $pesan = "Lahan ini sangat cocok ditanami $tanaman.";
        $warna = "#22c55e";
    }
    elseif ($skorAkhir >= 0.60) {
        $status = "Cukup Sesuai (S2)";
        $pesan = "Lahan ini cukup cocok ditanami $tanaman.";
        $warna = "#3b82f6";
    }
    elseif ($skorAkhir >= 0.40) {
        $status = "Sesuai Bersyarat (S3)";
        $pesan = "Lahan masih dapat digunakan untuk $tanaman namun memerlukan perbaikan beberapa parameter.";
        $warna = "#f59e0b";
    }
    else {
        $status = "Tidak Sesuai (N)";
        $pesan = "Perhatian: Lahan ini tidak cocok ditanami $tanaman karena ada parameter kritis yang nilainya terlalu rendah.";
        $warna = "#ef4444";
    }

    $result = [
        "tanaman" => $tanaman,
        "saw" => round($nilaiSAW, 3),
        "minimum" => round($nilaiMinimum, 3),
        "skor" => round($skorAkhir, 3),
        "status" => $status,
        "pesan" => $pesan,
        "warna" => $warna
    ];
}

?>

<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>SPK Pertanian - Fuzzy SAW & Liebig</title>

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:'Segoe UI',sans-serif;
}

body{
    background:linear-gradient(135deg,#16a34a,#22c55e);
    min-height:100vh;
    display:flex;
    justify-content:center;
    align-items:center;
    padding:20px;
}

.container{
    background:white;
    width:100%;
    max-width:850px;
    padding:35px;
    border-radius:20px;
    box-shadow:0 10px 30px rgba(0,0,0,.2);
}

h1{
    text-align:center;
    margin-bottom:10px;
    color:#166534;
}

.subtitle{
    text-align:center;
    color:#555;
    margin-bottom:25px;
}

.form-grid{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:18px;
}

.input-group{
    display:flex;
    flex-direction:column;
}

label{
    margin-bottom:6px;
    font-weight:600;
}

input,
select{
    padding:12px;
    border:1px solid #ccc;
    border-radius:10px;
    font-size:15px;
}

.full{
    grid-column:1/-1;
}

button{
    width:100%;
    border:none;
    padding:15px;
    background:#16a34a;
    color:white;
    font-size:16px;
    font-weight:bold;
    border-radius:12px;
    cursor:pointer;
    transition:.3s;
}

button:hover{
    background:#15803d;
}

.result{
    margin-top:25px;
    padding:20px;
    border-radius:15px;
    background:#f8fafc;
    border-left:6px solid;
}

.result h2{
    margin-bottom:15px;
}

.result p{
    margin:8px 0;
    line-height:1.6;
}

.badge{
    display:inline-block;
    padding:8px 14px;
    border-radius:30px;
    color:white;
    font-weight:bold;
}

@media(max-width:700px){

    .form-grid{
        grid-template-columns:1fr;
    }

}

</style>
</head>
<body>

<div class="container">

    <h1>🌱 Sistem Pendukung Keputusan Pertanian</h1>

    <p class="subtitle">
        Metode Fuzzy SAW + Hukum Minimum Liebig
    </p>

    <form method="POST">

        <div class="form-grid">

            <div class="input-group full">
                <label>Pilih Tanaman</label>
                <select name="tanaman" required>
                    <option value="Singkong">Singkong</option>
                    <option value="Sorgum">Sorgum</option>
                    <option value="Sagu">Sagu</option>
                    <option value="Jelai">Jelai</option>
                    <option value="Talas">Talas</option>
                    <option value="Jagung">Jagung</option>
                </select>
            </div>

            <div class="input-group">
                <label>Suhu Udara (0 - 1)</label>
                <input type="number" step="0.01" min="0" max="1" name="suhu" required>
            </div>

            <div class="input-group">
                <label>Curah Hujan (0 - 1)</label>
                <input type="number" step="0.01" min="0" max="1" name="hujan" required>
            </div>

            <div class="input-group">
                <label>pH Tanah (0 - 1)</label>
                <input type="number" step="0.01" min="0" max="1" name="ph" required>
            </div>

            <div class="input-group">
                <label>Ketinggian Tempat (0 - 1)</label>
                <input type="number" step="0.01" min="0" max="1" name="alt" required>
            </div>

            <div class="input-group">
                <label>Drainase Lahan (0 - 1)</label>
                <input type="number" step="0.01" min="0" max="1" name="drainase" required>
            </div>

            <div class="input-group">
                <label>Tekstur Tanah (0 - 1)</label>
                <input type="number" step="0.01" min="0" max="1" name="tekstur" required>
            </div>

            <div class="full">
                <button type="submit">
                    Cek Kesesuaian Lahan
                </button>
            </div>

        </div>

    </form>

    <?php if($result): ?>

        <div class="result" style="border-color: <?= $result['warna'] ?>">

            <h2>Hasil Analisis</h2>

            <p>
                <strong>Tanaman :</strong>
                <?= $result['tanaman'] ?>
            </p>

            <p>
                <strong>Nilai SAW :</strong>
                <?= $result['saw'] ?>
            </p>

            <p>
                <strong>Nilai Minimum Liebig :</strong>
                <?= $result['minimum'] ?>
            </p>

            <p>
                <strong>Skor Akhir :</strong>
                <?= $result['skor'] ?>
            </p>

            <p>
                <span class="badge"
                      style="background:<?= $result['warna'] ?>">
                    <?= $result['status'] ?>
                </span>
            </p>

            <p>
                <?= $result['pesan'] ?>
            </p>

        </div>

    <?php endif; ?>

</div>

</body>
</html>