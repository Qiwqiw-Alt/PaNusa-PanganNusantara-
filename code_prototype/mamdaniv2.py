# import numpy as np

class FuzzyMamdaniTanamanPangan:
    def __init__(self):
        self.OUTPUT_UNIVERSE_SIZE = 101
        self.OUTPUT_MIN = 0.0
        self.OUTPUT_MAX = 100.0

    # 1. Fungsi keanggotaan segitiga
    def trimf(self, x, a, b, c):
        if x <= a or x >= c: return 0.0
        elif x <= b: return (x - a) / (b - a) if (b - a) != 0 else 0.0
        else: return (c - x) / (c - b) if (c - b) != 0 else 0.0

    # 2. Fungsi Keanggotaan Trapesium
    def trapmf(self, x, abcd):
        a, b, c, d = abcd
        if x <= a or x >= d: return 0.0
        elif b <= x <= c: return 1.0
        elif a < x < b: return (x - a) / (b - a) if (b - a) != 0 else 0.0
        else: return (d - x) / (d - c) if (d - c) != 0 else 0.0

    # Fungsi untuk memfuzzifikasi nilai numerik berdasarkan batas tabel gambar
    def dapatkan_derajat_linguistik(self, x, param):
        if param[0] == 0 and param[1] == 0:
            mu_tinggi = self.trapmf(x, [0, 0, param[2], param[2]])
            mu_sedang = self.trimf(x, param[2], param[3], param[3])
            mu_rendah = 1.0 if x >= param[3] else 0.0
            return {"rendah": mu_rendah, "sedang": mu_sedang, "tinggi": mu_tinggi}

        # 2. Kasus Normal (Suhu, Hujan, pH)
        mu_tinggi = self.trapmf(x, [param[1], param[1], param[2], param[2]])
        
        # Menghitung Sedang Bawah dan Sedang Atas
        mu_sedang_bawah = self.trimf(x, param[0], param[0], param[1])
        mu_sedang_atas = self.trimf(x, param[2], param[3], param[3])
        mu_sedang = max(mu_sedang_bawah, mu_sedang_atas)
        
        # Mengunci nilai rendah mutlak jika berada di luar batas Absolute Minimum atau Absolute Maximum
        if x <= param[0] or x >= param[3]:
            mu_rendah = 1.0
            mu_sedang = 0.0
            mu_tinggi = 0.0
        else:
            # Sisa komplemen di dalam lereng transisi
            mu_rendah = 1.0 - (mu_tinggi + mu_sedang)
            mu_rendah = max(0.0, min(1.0, mu_rendah))
        
        return {"rendah": mu_rendah, "sedang": mu_sedang, "tinggi": mu_tinggi}

    # 3. Fungsi Keanggotaan Output Kelayakan (Mamdani)
    def mf_output_rendah(self, x): return self.trapmf(x, [0, 0, 25, 50])
    def mf_output_sedang(self, x): return self.trimf(x, 25, 50, 75)
    def mf_output_tinggi(self, x): return self.trapmf(x, [50, 75, 100, 100])

    # 4. Fungsi Generator 81 Aturan Otomatis dengan Veto "Rendah"
    def evaluasi_81_rules(self, tanaman, f_suhu, f_hujan, f_ph, f_tinggi):
        tingkat_kelayakan = {"rendah": [], "sedang": [], "tinggi": []}
        labels = ["rendah", "sedang", "tinggi"]
        
        # Loop Generator Kombinasi Kombinatorik 3^4 = 81 Aturan
        for s in labels:
            for h in labels:
                for p in labels:
                    for k in labels:
                        
                        bobot_aturan = min(f_suhu[s], f_hujan[h], f_ph[p], f_tinggi[k])
                        
                        if bobot_aturan == 0: continue
                        
                        if s == "rendah" or h == "rendah" or p == "rendah" or k == "rendah":
                            tingkat_kelayakan["rendah"].append(bobot_aturan)
                            continue
                            
                        # B. AREA INPUT MANDIRI KARAKTERISTIK KHUSUS (Dari hasil analisis tabel & teks)
                        # if tanaman == 'sorgum':
                        #     if s == "tinggi" and h == "tinggi" and p == "tinggi" and k == "tinggi":
                        #         tingkat_kelayakan["tinggi"].append(bobot_aturan)
                        #     elif  s == "tinggi" and h == "sedang" and p == "tinggi" and k == "tinggi":
                        #         tingkat_kelayakan["tinggi"].append(bobot_aturan)
                        #     elif s == "sedang" and h == "sedang" and p == "sedang" and k == "sedang":
                        #         tingkat_kelayakan["rendah"].append(bobot_aturan)
                        #     else:
                        #         tingkat_kelayakan["sedang"].append(bobot_aturan)
                        
                        # elif tanaman == 'sagu':
                        #     if s == "tinggi" and h == "tinggi" and p == "tinggi" and k == "tinggi":
                        #         tingkat_kelayakan["tinggi"].append(bobot_aturan)
                        #     elif s == "tinggi" and h == "tinggi" and p == "sedang" and k == "tinggi":
                        #         tingkat_kelayakan["tinggi"].append(bobot_aturan)
                        #     elif s == "sedang" and h == "sedang" and p == "sedang" and k == "sedang":
                        #         tingkat_kelayakan["rendah"].append(bobot_aturan)
                        #     else:
                        #         tingkat_kelayakan["sedang"].append(bobot_aturan)
                                
                        # elif tanaman == 'gembili':
                        #     if s == "tinggi" and h == "tinggi" and p == "tinggi" and k == "tinggi":
                        #         tingkat_kelayakan["tinggi"].append(bobot_aturan)
                        #     elif s == "tinggi" and h == "sedang" and p == "tinggi" and k == "tinggi":
                        #         tingkat_kelayakan["tinggi"].append(bobot_aturan)
                        #     elif s == "sedang" and h == "sedang" and p == "sedang" and k == "sedang":
                        #         tingkat_kelayakan["rendah"].append(bobot_aturan)
                        #     else:
                        #         tingkat_kelayakan["sedang"].append(bobot_aturan)
                                
                        # elif tanaman == 'jelai':
                        #     if (s == "tinggi" and h == "tinggi" and p == "tinggi" and k == "tinggi") or \
                        #        (s == "tinggi" and h == "tinggi" and p == "tinggi" and k == "sedang") or \
                        #        (s == "tinggi" and h == "tinggi" and p == "sedang" and k == "tinggi") or \
                        #        (s == "tinggi" and h == "sedang" and p == "tinggi" and k == "tinggi") or \
                        #        (s == "sedang" and h == "tinggi" and p == "tinggi" and k == "tinggi"):
                        #         tingkat_kelayakan["tinggi"].append(bobot_aturan)
                        #     elif s == "sedang" and h == "sedang" and p == "sedang" and k == "sedang":
                        #         tingkat_kelayakan["rendah"].append(bobot_aturan)
                        #     else:
                        #         tingkat_kelayakan["sedang"].append(bobot_aturan)
                                
                        # elif tanaman == 'talas':
                        #     if (s == "tinggi" and h == "tinggi" and p == "tinggi" and k == "tinggi") or \
                        #        (s == "tinggi" and h == "tinggi" and p == "tinggi" and k == "sedang") or \
                        #        (s == "tinggi" and h == "tinggi" and p == "sedang" and k == "tinggi") or \
                        #        (s == "tinggi" and h == "sedang" and p == "tinggi" and k == "tinggi") or \
                        #        (s == "sedang" and h == "tinggi" and p == "tinggi" and k == "tinggi"):
                        #         tingkat_kelayakan["tinggi"].append(bobot_aturan)
                        #     else:
                        #         tingkat_kelayakan["sedang"].append(bobot_aturan)


                        if tanaman == 'sorgum':
                            if s == "tinggi" and h == "tinggi" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["tinggi"].append(bobot_aturan)
                            elif s == "tinggi" and h == "tinggi" and p == "tinggi" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "tinggi" and h == "tinggi" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "tinggi" and h == "tinggi" and p == "sedang" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "tinggi" and h == "sedang" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["tinggi"].append(bobot_aturan)
                            elif s == "tinggi" and h == "sedang" and p == "tinggi" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "tinggi" and h == "sedang" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "tinggi" and h == "sedang" and p == "sedang" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "tinggi" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "tinggi" and p == "tinggi" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "tinggi" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "tinggi" and p == "sedang" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "tinggi" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "sedang" and k == "sedang":
                                tingkat_kelayakan["rendah"].append(bobot_aturan)
                        
                        elif tanaman == 'sagu':
                            if s == "tinggi" and h == "tinggi" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["tinggi"].append(bobot_aturan)
                            elif s == "tinggi" and h == "tinggi" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["tinggi"].append(bobot_aturan)
                            elif s == "tinggi" and h == "sedang" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "tinggi" and h == "sedang" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "tinggi" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "tinggi" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "sedang" and k == "sedang":
                                tingkat_kelayakan["rendah"].append(bobot_aturan)

                        elif tanaman == 'gembili':
                            if s == "tinggi" and h == "tinggi" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["tinggi"].append(bobot_aturan)
                            elif s == "tinggi" and h == "tinggi" and p == "tinggi" and k == "sedang":
                                tingkat_kelayakan["tinggi"].append(bobot_aturan)
                            elif s == "tinggi" and h == "tinggi" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "tinggi" and h == "tinggi" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "tinggi" and h == "sedang" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["tinggi"].append(bobot_aturan)
                            elif s == "tinggi" and h == "sedang" and p == "tinggi" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "tinggi" and h == "sedang" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "tinggi" and h == "sedang" and p == "sedang" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "tinggi" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "tinggi" and p == "tinggi" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "tinggi" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "tinggi" and p == "sedang" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "tinggi" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "sedang" and k == "sedang":
                                tingkat_kelayakan["rendah"].append(bobot_aturan)
          
                        elif tanaman == 'jelai':
                            if s == "tinggi" and h == "tinggi" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["tinggi"].append(bobot_aturan)
                            elif s == "tinggi" and h == "tinggi" and p == "tinggi" and k == "sedang":
                                tingkat_kelayakan["tinggi"].append(bobot_aturan)
                            elif s == "tinggi" and h == "tinggi" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["tinggi"].append(bobot_aturan)
                            elif s == "tinggi" and h == "tinggi" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "tinggi" and h == "sedang" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["tinggi"].append(bobot_aturan)
                            elif s == "tinggi" and h == "sedang" and p == "tinggi" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "tinggi" and h == "sedang" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "tinggi" and h == "sedang" and p == "sedang" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "tinggi" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["tinggi"].append(bobot_aturan)
                            elif s == "sedang" and h == "tinggi" and p == "tinggi" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "tinggi" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "tinggi" and p == "sedang" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "tinggi" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "sedang" and k == "sedang":
                                tingkat_kelayakan["rendah"].append(bobot_aturan)
                  
                        elif tanaman == 'talas':
                            if s == "tinggi" and h == "tinggi" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["tinggi"].append(bobot_aturan)
                            elif s == "tinggi" and h == "tinggi" and p == "tinggi" and k == "sedang":
                                tingkat_kelayakan["tinggi"].append(bobot_aturan)
                            elif s == "tinggi" and h == "tinggi" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["tinggi"].append(bobot_aturan)
                            elif s == "tinggi" and h == "tinggi" and p == "sedang" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "tinggi" and h == "sedang" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["tinggi"].append(bobot_aturan)
                            elif s == "tinggi" and h == "sedang" and p == "tinggi" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "tinggi" and h == "sedang" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "tinggi" and h == "sedang" and p == "sedang" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "tinggi" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["tinggi"].append(bobot_aturan)
                            elif s == "sedang" and h == "tinggi" and p == "tinggi" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "tinggi" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "tinggi" and p == "sedang" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "tinggi" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "tinggi" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "sedang" and k == "tinggi":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
                            elif s == "sedang" and h == "sedang" and p == "sedang" and k == "sedang":
                                tingkat_kelayakan["sedang"].append(bobot_aturan)
              
                 
                            
        # Agregasi Kombinasi Nilai Maksimum (Fuzzy OR)
        skor_rendah = max(tingkat_kelayakan["rendah"]) if tingkat_kelayakan["rendah"] else 0.0
        skor_sedang = max(tingkat_kelayakan["sedang"]) if tingkat_kelayakan["sedang"] else 0.0
        skor_tinggi = max(tingkat_kelayakan["tinggi"]) if tingkat_kelayakan["tinggi"] else 0.0
        
        return skor_rendah, skor_sedang, skor_tinggi

    # 5. Core Inference Engine Murni dengan 4 Variabel
    def fuzzy_inference(self, suhu, hujan, ph, tinggi):
        basis_pengetahuan = {
            'sorgum':   {'suhu': [8, 22, 35, 40],    'hujan': [300, 400, 600, 700],     'ph': [5.0, 5.5, 7.5, 8.0], 'tinggi': [0, 0, 2250, 2500]}, # untuk ketinggian masih belum fix
            'sagu':     {'suhu': [18, 25, 36, 40],   'hujan': [2100, 3000, 4500, 5800], 'ph': [4.5, 5.5, 6.5, 8.5], 'tinggi': [0, 0, 630, 700]},
            'gembili':  {'suhu': [17, 28, 32, 45],   'hujan': [600, 800, 2000, 8000],   'ph': [4.5, 5.5, 6.5, 8.5], 'tinggi': [0, 0, 810, 900]},
            'jelai':    {'suhu': [2, 15, 20, 40],    'hujan': [200, 500, 1000, 2000],   'ph': [6.0, 6.5, 7.5, 8.0], 'tinggi': [0, 0, 3960, 4400]},
            'talas':    {'suhu': [10, 21, 28, 35],   'hujan': [1000, 1800, 2700, 4100], 'ph': [4.3, 5.5, 6.5, 8.2], 'tinggi': [0, 0, 2430, 2700]}
        }

        activation_rules = {}

        for tanaman, param in basis_pengetahuan.items():
            f_suhu   = self.dapatkan_derajat_linguistik(suhu, param['suhu'])
            f_hujan  = self.dapatkan_derajat_linguistik(hujan, param['hujan'])
            f_ph     = self.dapatkan_derajat_linguistik(ph, param['ph'])
            f_tinggi = self.dapatkan_derajat_linguistik(tinggi, param['tinggi'])

            skor_rendah, skor_sedang, skor_tinggi = self.evaluasi_81_rules(tanaman, f_suhu, f_hujan, f_ph, f_tinggi)

            activation_rules[tanaman] = {
                "rendah": skor_rendah,
                "sedang": skor_sedang,
                "tinggi": skor_tinggi
            }

        return activation_rules

    # 6. Proses Deffuzifikasi COG
    def defuzzify_cog(self, activation_dict):
        results = {}

        for tanaman, levels in activation_dict.items():
            numerator = 0.0
            denominator = 0.0

            for i in range(self.OUTPUT_UNIVERSE_SIZE):
                x = self.OUTPUT_MIN + i * (self.OUTPUT_MAX - self.OUTPUT_MIN) / (self.OUTPUT_UNIVERSE_SIZE - 1)

                combined_membership = max(
                    min(levels["rendah"], self.mf_output_rendah(x)),
                    min(levels["sedang"], self.mf_output_sedang(x)),
                    min(levels["tinggi"], self.mf_output_tinggi(x))
                )

                numerator += x * combined_membership
                denominator += combined_membership

            results[tanaman] = (numerator / denominator) if denominator != 0 else 0.0

        return results

def hitungKelayakan(sistem, suhu, hujan, ph, tinggi):
    rules = sistem.fuzzy_inference(suhu, hujan, ph, tinggi)
    hasil = sistem.defuzzify_cog(rules)
    return hasil

def tampilkanHasil(hasil):
    for tanaman, skor in sorted(hasil.items(), key=lambda x: x[1], reverse=True):
        print(f"Kelayakan {tanaman.upper()}: {skor:.2f}%")

if __name__ == "__main__":
    sistemFuzzy = FuzzyMamdaniTanamanPangan()
    
    print("=== PENGUJIAN SKENARIO LAHAN NTT (KERING TROPIS) ===")
    hasil_ntt = hitungKelayakan(sistemFuzzy, suhu=30, hujan=500, ph=6.5, tinggi=150)
    tampilkanHasil(hasil_ntt)
    
    print("\n=== PENGUJIAN SKENARIO LAHAN PEGUNUNGAN BASAH ===")
    hasil_gunung = hitungKelayakan(sistemFuzzy, suhu=16, hujan=1200, ph=6.5, tinggi=1200)
    tampilkanHasil(hasil_gunung)