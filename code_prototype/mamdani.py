# import numpy as np

class FuzzyMamdaniTanamanPangan:
    def __init__(self):
        self.OUTPUT_UNIVERSE_SIZE = 101
        self.OUTPUT_MIN = 0.0
        self.OUTPUT_MAX = 100.0

    #1. FUngsi keanggotaan segitiga
    def trimf(self, x, a, b, c):
        if x <= a or x >= c: return 0.0
        elif x <= b: return (x - a) / (b - a) if (b - a) != 0 else 0.0
        else: return (c - x) / (c - b) if (c - b) != 0 else 0.0

    # 2. Fungsi Keanggotaan Trapesium (Untuk Mengakomodasi Zona Optimal FAO)
    def trapmf(self, x, abcd):
        a, b, c, d = abcd
        if x <= a or x >= d: return 0.0
        elif b <= x <= c: return 1.0
        elif a < x < b: return (x - a) / (b - a) if (b - a) != 0 else 0.0
        else: return (d - x) / (d - c) if (d - c) != 0 else 0.0

    # 3. Fungsi Keanggotaan Output Kelayakan (Mamdani)
    def mf_output_rendah(self, x): return self.trapmf(x, [0, 0, 25, 50])
    def mf_output_sedang(self, x): return self.trimf(x, 25, 50, 75)
    def mf_output_tinggi(self, x): return self.trapmf(x, [50, 75, 100, 100])

    # 4. Pembobotan Variabel Kategorikal/Crisp (Drainase & Tekstur)
    def nilai_kategorikal(self, tanaman, drainase_input, tekstur_input):
        basis_kategori = {
            'sorgum': {
                'drainase': {'optimal': ['well'], 'absolute': ['well', 'excessive']},
                'tekstur': {'optimal': ['heavy', 'medium'], 'absolute': ['wide']}
            },
            'sagu': {
                'drainase': {'optimal': ['poorly'], 'absolute': ['poorly', 'well']},
                'tekstur': {'optimal': ['heavy', 'medium'], 'absolute': ['heavy', 'medium', 'light', 'organic']}
            },
            'gembili': {
                'drainase': {'optimal': ['well'], 'absolute': ['well']},
                'tekstur': {'optimal': ['medium', 'organic'], 'absolute': ['medium', 'light']}
            },
            'jelai': {
                'drainase': {'optimal': ['well'], 'absolute': ['well']},
                'tekstur': {'optimal': ['medium'], 'absolute': ['heavy', 'medium', 'light']}
            },
            'singkong': {
                'drainase': {'optimal': ['well'], 'absolute': ['well', 'excessive']},
                'tekstur': {'optimal': ['medium', 'light'], 'absolute': ['heavy', 'medium', 'light', 'organic']}
            },
            'talas': {
                'drainase': {'optimal': ['poorly', 'well'], 'absolute': ['poorly', 'well']},
                'tekstur': {'optimal': ['medium', 'organic'], 'absolute': ['heavy', 'medium']}
            }
        }

        dr = drainase_input.lower().strip()
        tk = tekstur_input.lower().strip()
        data = basis_kategori[tanaman]

        skor_dr = 1.0 if dr in data['drainase']['optimal'] else (0.5 if dr in data['drainase']['absolute'] else 0.0)
        skor_tk = 1.0 if tk in data['tekstur']['optimal'] else (0.5 if tk in data['tekstur']['absolute'] else 0.0)
        
        return min(skor_dr, skor_tk)
    
    # 5. Core Inference Engine (Mamdani Implikasi)
    def fuzzy_inference(self, suhu, hujan, ph, tinggi, drainase, tekstur):
        basis = {
            'sorgum':   {'suhu': [8, 22, 35, 40],    'hujan': [300, 400, 600, 700],     'ph': [5.0, 5.5, 7.5, 8.0], 'tinggi': [0, 0, 2250, 2500]},
            'sagu':     {'suhu': [18, 25, 36, 40],   'hujan': [2100, 3000, 4500, 5800], 'ph': [4.5, 5.5, 6.5, 8.5], 'tinggi': [0, 0, 630, 700]},
            'gembili':  {'suhu': [17, 28, 32, 45],   'hujan': [600, 800, 2000, 8000],   'ph': [4.5, 5.5, 6.5, 8.5], 'tinggi': [0, 0, 810, 900]},
            'jelai':    {'suhu': [2, 15, 20, 40],    'hujan': [200, 500, 1000, 2000],   'ph': [6.0, 6.5, 7.5, 8.0], 'tinggi': [0, 0, 3960, 4400]},
            'singkong': {'suhu': [10, 20, 29, 45],   'hujan': [500, 1000, 1500, 5000],  'ph': [4.0, 5.5, 8.0, 9.0], 'tinggi': [0, 0, 1800, 2000]},
            'talas':    {'suhu': [10, 21, 28, 35],   'hujan': [1000, 1800, 2700, 4100], 'ph': [4.3, 5.5, 6.5, 8.2], 'tinggi': [0, 0, 2430, 2700]}
        }

        activation_rules = {}

        for tanaman, param in basis.items():
            mu_suhu   = self.trapmf(suhu, param['suhu'])
            mu_hujan  = self.trapmf(hujan, param['hujan'])
            mu_ph     = self.trapmf(ph, param['ph'])
            mu_tinggi = self.trapmf(tinggi, param['tinggi'])

            # b. Ambil Skor Pembatas Kategorikal Tanah
            faktor_kategorikal = self.nilai_kategorikal(tanaman, drainase, tekstur)

            # c. Operasi MIN Mamdani untuk Menentukan Derajat Aktivasi Rule
            # Lahan dinilai SANGAT COCOK (Tinggi) jika semua parameter makro bernilai optimal
            skor_tinggi = min(mu_suhu, mu_hujan, mu_ph, mu_tinggi) * faktor_kategorikal
            
            # Kondisi SEDANG: Jika tanah masih batas toleransi tetapi ada parameter makro yang bernilai samar
            skor_sedang = max(0.0, (0.5 - skor_tinggi)) * (1.0 if faktor_kategorikal > 0 else 0.0)
            
            # Kondisi RENDAH: Jika salah satu parameter bernilai ekstrem (0) atau tanah tidak mendukung
            skor_rendah = 1.0 - max(skor_tinggi, skor_sedang) if faktor_kategorikal > 0 else 1.0

            activation_rules[tanaman] = {
                "rendah": skor_rendah,
                "sedang": skor_sedang,
                "tinggi": skor_tinggi
            }

        return activation_rules
    

    #6. Proses Deffuzifikasi COG
    def defuzzify_cog(self, activation_dict):
        results = {}

        for tanaman, levels in activation_dict.items():
            numerator = 0.0
            denominator = 0.0

            for i in range(self.OUTPUT_UNIVERSE_SIZE):
                x = self.OUTPUT_MIN + i * (self.OUTPUT_MAX - self.OUTPUT_MIN) / (self.OUTPUT_UNIVERSE_SIZE - 1)

                # Komposisi Aturan Max-Min Mamdani
                combined_membership = max(
                    min(levels["rendah"], self.mf_output_rendah(x)),
                    min(levels["sedang"], self.mf_output_sedang(x)),
                    min(levels["tinggi"], self.mf_output_tinggi(x))
                )

                numerator += x * combined_membership
                denominator += combined_membership

            results[tanaman] = (numerator / denominator) if denominator != 0 else 0.0

        return results


if __name__ == "__main__":
    engine = FuzzyMamdaniTanamanPangan()
    
    # KASUS UJI 1: Lahan kering NTT dengan tekstur medium dan drainase baik (Suhu tinggi, mdpl rendah)
    print("=== PENGUJIAN SKENARIO LAHAN KHAS NTT ===")
    rules_ntt = engine.fuzzy_inference(suhu=30, hujan=500, ph=6.5, tinggi=150, drainase="well", tekstur="medium")
    hasil_ntt = engine.defuzzify_cog(rules_ntt)
    
    for tanaman, skor in sorted(hasil_ntt.items(), key=lambda x: x[1], reverse=True):
        print(f"Kelayakan {tanaman.upper()}: {skor:.2f}%")
        
    # KASUS UJI 2: Lahan dataran tinggi basah dingin dengan drainase buruk
    print("\n=== PENGUJIAN SKENARIO LAHAN PEGUNUNGAN BASAH ===")
    rules_gunung = engine.fuzzy_inference(suhu=14, hujan=1800, ph=5.8, tinggi=2100, drainase="poorly", tekstur="heavy")
    hasil_gunung = engine.defuzzify_cog(rules_gunung)
    
    for tanaman, skor in sorted(hasil_gunung.items(), key=lambda x: x[1], reverse=True):
        print(f"Kelayakan {tanaman.upper()}: {skor:.2f}%")