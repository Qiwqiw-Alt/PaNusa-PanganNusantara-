from flask import Flask, request, jsonify
from mamdani import FuzzyMamdaniTanamanPangan 

app = Flask(__name__)
engine = FuzzyMamdaniTanamanPangan()

# Membuat Endpoint API untuk diakses oleh JavaScript frontend
@app.route('/api/hitung-kelayakan', methods=['POST'])
def hitung_kelayakan():
    data = request.get_json()
    
    suhu = float(data.get('suhu'))
    hujan = float(data.get('hujan'))
    ph = float(data.get('ph'))
    tinggi = float(data.get('tinggi'))
    drainase = data.get('drainase')
    tekstur = data.get('tekstur')

    rules = engine.fuzzy_inference(suhu, hujan, ph, tinggi, drainase, tekstur)
    skor_kesesuaian = engine.defuzzify_cog(rules)
    
    perangkingan = dict(sorted(skor_kesesuaian.items(), key=lambda x: x[1], reverse=True))

    return jsonify({
        "status": "success",
        "message": "Kalkulasi logika fuzzy Mamdani berhasil dilakukan.",
        "data": perangkingan
    })

if __name__ == '__main__':
    app.run(debug=True, port=5000)