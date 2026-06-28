// Label untuk pesan (agar lebih enak dibaca)
const labelParameter = {
  suhu: "Suhu Udara",
  hujan: "Curah Hujan",
  ph: "pH Tanah",
  alt: "Ketinggian Tempat"
};

// Update angka saat slider digeser
function updateVal(spanId, value) {
  document.getElementById(spanId).innerText = parseFloat(value).toFixed(2);
}

// 2. Logika ketika tombol submit ditekan
document.getElementById('spkForm').addEventListener('submit', function (e) {
  e.preventDefault(); // Mencegah halaman refresh

  // Ambil data input
  const tanaman = document.getElementById('tanaman').value;
  const lahan = {
    suhu: parseFloat(document.getElementById('suhu').value),
    hujan: parseFloat(document.getElementById('hujan').value),
    ph: parseFloat(document.getElementById('ph').value),
    alt: parseFloat(document.getElementById('alt').value),
  };

  const bobot = bobotTanaman[tanaman];

  // 6. Penentuan Status & Kelas CSS
  let status = "", kelasCSS = "", pesan = "";
  const namaParamKritis = labelParameter[paramKritis];

  if (skorAkhir >= 0.80) {
    status = "Sangat Sesuai (S1)";
    kelasCSS = "status-s1";
    pesan = `Lahan ini sangat ideal dan cocok ditanami <strong>${tanaman}</strong>. Pertumbuhan diprediksi maksimal.`;
  } else if (skorAkhir >= 0.60) {
    status = "Cukup Sesuai (S2)";
    kelasCSS = "status-s2";
    pesan = `Lahan ini cukup cocok untuk <strong>${tanaman}</strong>. Hasil bisa maksimal dengan sedikit perbaikan lahan.`;
  } else if (skorAkhir >= 0.40) {
    status = "Sesuai Bersyarat (S3)";
    kelasCSS = "status-s3";
    pesan = `Lahan bisa digunakan untuk <strong>${tanaman}</strong>, namun butuh treatment ekstra. Faktor <strong>${namaParamKritis} (${nilaiMinimum.toFixed(2)})</strong> menjadi tantangan utama.`;
  } else {
    status = "Tidak Sesuai (N)";
    kelasCSS = "status-n";
    pesan = `Perhatian: Lahan ini <strong>TIDAK COCOK</strong> ditanami ${tanaman} karena parameter kritis (<strong>${namaParamKritis} = ${nilaiMinimum.toFixed(2)}</strong>) terlalu rendah dan berisiko gagal panen.`;
  }

  // 7. Tampilkan ke UI
  const resultContainer = document.getElementById('resultContainer');

  // Reset class warna
  resultContainer.className = '';
  resultContainer.classList.add(kelasCSS);

  // Masukkan data
  document.getElementById('resTanaman').innerText = tanaman;
  document.getElementById('resSkor').innerText = skorAkhir.toFixed(3);
  document.getElementById('resStatus').innerText = status;
  document.getElementById('resPesan').innerHTML = pesan;
  
  // Munculkan kotaknya dengan scroll
  resultContainer.style.display = 'block';
  resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
});