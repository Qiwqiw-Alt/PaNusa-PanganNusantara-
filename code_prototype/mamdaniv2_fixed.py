import pandas as pd
import numpy as np

class FuzzyMamdaniTanamanPangan:
    def __init__(self):
        self.OUTPUT_UNIVERSE_SIZE = 101
        self.OUTPUT_MIN = 0.0
        self.OUTPUT_MAX = 100.0
        self.rule_base = self.load_rule_base()

    def load_rule_base(self):
        """Load rule base from Excel file"""
        file_path = '/home/workdir/attachments/_Rule Base Mamdani (2).xlsx'
        rule_base = {}
        sheet_names = ['Sorgum', 'Sagu', 'Gembili', 'Jelai', 'Talas']
        
        for sheet in sheet_names:
            df = pd.read_excel(file_path, sheet_name=sheet, header=None)
            rules = []
            for idx, row in df.iterrows():
                if idx == 0:  # Skip header
                    continue
                try:
                    rule_num = int(row[0])
                    suhu = str(row[1]).strip().lower()
                    hujan = str(row[2]).strip().lower()
                    ph = str(row[3]).strip().lower()
                    ketinggian = str(row[4]).strip().lower()
                    output = str(row[5]).strip().upper()
                    rules.append({
                        'suhu': suhu,
                        'hujan': hujan,
                        'ph': ph,
                        'ketinggian': ketinggian,
                        'output': output
                    })
                except:
                    continue
            rule_base[sheet.lower()] = rules
        return rule_base

    # Fungsi keanggotaan
    def trimf(self, x, a, b, c):
        if x <= a or x >= c: return 0.0
        elif x <= b: return (x - a) / (b - a) if (b - a) != 0 else 0.0
        else: return (c - x) / (c - b) if (c - b) != 0 else 0.0

    def trapmf(self, x, abcd):
        a, b, c, d = abcd
        if x <= a or x >= d: return 0.0
        elif b <= x <= c: return 1.0
        elif a < x < b: return (x - a) / (b - a) if (b - a) != 0 else 0.0
        else: return (d - x) / (d - c) if (d - c) != 0 else 0.0

    def dapatkan_derajat_linguistik(self, x, param):
        if param[0] == 0 and param[1] == 0:  # Ketinggian
            mu_tinggi = self.trapmf(x, [0, 0, param[2], param[2]])
            mu_sedang = self.trimf(x, param[2], param[3], param[3])
            mu_rendah = 1.0 if x >= param[3] else 0.0
            return {"rendah": mu_rendah, "sedang": mu_sedang, "tinggi": mu_tinggi}

        # Normal case
        mu_tinggi = self.trapmf(x, [param[1], param[1], param[2], param[2]])
        mu_sedang_bawah = self.trimf(x, param[0], param[0], param[1])
        mu_sedang_atas = self.trimf(x, param[2], param[3], param[3])
        mu_sedang = max(mu_sedang_bawah, mu_sedang_atas)

        if x <= param[0] or x >= param[3]:
            mu_rendah = 1.0
            mu_sedang = 0.0
            mu_tinggi = 0.0
        else:
            mu_rendah = max(0.0, min(1.0, 1.0 - (mu_tinggi + mu_sedang)))
        
        return {"rendah": mu_rendah, "sedang": mu_sedang, "tinggi": mu_tinggi}

    # Output membership
    def mf_output_rendah(self, x): return self.trapmf(x, [0, 0, 25, 50])
    def mf_output_sedang(self, x): return self.trimf(x, 25, 50, 75)
    def mf_output_tinggi(self, x): return self.trapmf(x, [50, 75, 100, 100])

    def fuzzy_inference(self, suhu, hujan, ph, tinggi):
        basis_pengetahuan = {
            'sorgum':   {'suhu': [8, 22, 35, 40],    'hujan': [300, 400, 600, 700],     'ph': [5.0, 5.5, 7.5, 8.0], 'tinggi': [0, 0, 2250, 2500]},
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

            # Use rule base
            skor_rendah = skor_sedang = skor_tinggi = 0.0
            rules = self.rule_base.get(tanaman, [])

            for rule in rules:
                alpha = min(
                    f_suhu.get(rule['suhu'], 0),
                    f_hujan.get(rule['hujan'], 0),
                    f_ph.get(rule['ph'], 0),
                    f_tinggi.get(rule['ketinggian'], 0)
                )
                if alpha > 0:
                    if rule['output'] == 'RENDAH':
                        skor_rendah = max(skor_rendah, alpha)
                    elif rule['output'] == 'SEDANG':
                        skor_sedang = max(skor_sedang, alpha)
                    elif rule['output'] == 'TINGGI':
                        skor_tinggi = max(skor_tinggi, alpha)

            activation_rules[tanaman] = {
                "rendah": skor_rendah,
                "sedang": skor_sedang,
                "tinggi": skor_tinggi
            }

        return activation_rules

    def defuzzify_cog(self, activation_dict):
        results = {}
        for tanaman, levels in activation_dict.items():
            numerator = 0.0
            denominator = 0.0
            for i in range(self.OUTPUT_UNIVERSE_SIZE):
                x = self.OUTPUT_MIN + i * (self.OUTPUT_MAX - self.OUTPUT_MIN) / (self.OUTPUT_UNIVERSE_SIZE - 1)
                combined = max(
                    min(levels["rendah"], self.mf_output_rendah(x)),
                    min(levels["sedang"], self.mf_output_sedang(x)),
                    min(levels["tinggi"], self.mf_output_tinggi(x))
                )
                numerator += x * combined
                denominator += combined
            results[tanaman] = (numerator / denominator) if denominator != 0 else 0.0
        return results

def hitungKelayakan(sistem, suhu, hujan, ph, tinggi):
    rules = sistem.fuzzy_inference(suhu, hujan, ph, tinggi)
    hasil = sistem.defuzzify_cog(rules)
    return hasil

def tampilkanHasil(hasil):
    print("\n=== HASIL KESESUAIAN LAHAN ===")
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