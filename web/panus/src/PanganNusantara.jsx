import { useState, useRef, useEffect } from "react";
import { CROPS, analyzeAll } from "./Calculation";

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function ScoreRing({ score, size = 76, strokeWidth = 5 }) {
  const canvasRef = useRef(null);
  const color = score >= 70 ? "#3B6D11" : score >= 40 ? "#BA7517" : "#A32D2D";
  const r = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * r;
  const progress = (score / 100) * circumference;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cx = size / 2, cy = size / 2;
    canvas.width = size;
    canvas.height = size;
    ctx.clearRect(0, 0, size, size);

    // Track
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "#e0e0d0";
    ctx.lineWidth = strokeWidth;
    ctx.stroke();

    // Progress
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + (score / 100) * Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = "round";
    ctx.stroke();

    // Label
    ctx.fillStyle = "#1a1a1a";
    ctx.font = `500 ${size < 60 ? 12 : 16}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(score + "%", cx, cy);
  }, [score, size]);

  return <canvas ref={canvasRef} style={{ width: size, height: size, flexShrink: 0 }} />;
}

function SliderCard({ icon, label, id, min, max, step, value, unit, onChange, displayValue }) {
  return (
    <div style={{
      background: "#f5f4ef",
      borderRadius: 10,
      padding: "14px 16px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "#6b7155", display: "flex", alignItems: "center", gap: 5 }}>
          {icon} {label}
        </span>
        <span style={{ fontSize: 20, fontWeight: 500, color: "#3B6D11" }}>
          {displayValue}<span style={{ fontSize: 11, color: "#888", marginLeft: 1 }}>{unit}</span>
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: "#3B6D11" }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#aaa", marginTop: 3 }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function TopResultCard({ result }) {
  const crop = CROPS[result.key];
  return (
    <div style={{
      background: "#fff",
      border: "1.5px solid #3B6D11",
      borderRadius: 14,
      padding: "1.25rem",
      display: "flex",
      gap: "1.25rem",
      alignItems: "center",
      marginBottom: "0.75rem",
    }}>
      <ScoreRing score={result.score} size={76} />
      <div style={{ flex: 1 }}>
        <div style={{
          display: "inline-block",
          fontSize: 10,
          padding: "3px 10px",
          background: "#EAF3DE",
          color: "#3B6D11",
          borderRadius: 20,
          marginBottom: 6,
        }}>
          ★ Rekomendasi utama
        </div>
        <h3 style={{ fontSize: 18, fontWeight: 500, margin: "0 0 2px" }}>
          {result.key}{" "}
          <span style={{ fontSize: 12, fontWeight: 400, color: "#888" }}>
            ({crop.latin})
          </span>
        </h3>
        <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6, margin: "0 0 8px" }}>
          {crop.desc}
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {["Suhu", "Curah Hujan", "pH Tanah", "Ketinggian"].map((t) => (
            <span key={t} style={{
              fontSize: 10,
              padding: "2px 8px",
              borderRadius: 20,
              background: "#f0f0ea",
              color: "#666",
              border: "0.5px solid #ddd",
            }}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AltResultCard({ result, rank }) {
  const crop = CROPS[result.key];
  const color = result.score >= 70 ? "#3B6D11" : result.score >= 40 ? "#BA7517" : "#A32D2D";
  return (
    <div style={{
      background: "#fff",
      border: "0.5px solid #ddd",
      borderRadius: 14,
      padding: "1rem",
      display: "flex",
      gap: "0.875rem",
      alignItems: "center",
    }}>
      <ScoreRing score={result.score} size={52} strokeWidth={4} />
      <div>
        <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 2px" }}>{result.key}</p>
        <p style={{ fontSize: 11, color: "#888", margin: "0 0 4px", fontStyle: "italic" }}>
          {crop.latin}
        </p>
        <span style={{ fontSize: 10, color: "#aaa" }}>Rank #{rank}</span>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function PanganNusantara() {
  const [suhu, setSuhu] = useState(25);
  const [hujan, setHujan] = useState(1200);
  const [ph, setPh] = useState(6.5);
  const [alt, setAlt] = useState(500);
  const [results, setResults] = useState(null);

  function handleAnalyze() {
    const ranked = analyzeAll(suhu, hujan, ph, alt);
    setResults(ranked);
  }

  function handleReset() {
    setResults(null);
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>

      {/* ── Hero ── */}
      <div style={{
        background: "#2D4A2D",
        padding: "2rem 1.5rem 1.5rem",
        borderRadius: "14px 14px 0 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1.5rem" }}>
          <div style={{
            width: 28, height: 28, background: "#5C8C3E",
            borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            🌿
          </div>
          <span style={{ color: "#B8D4A8", fontSize: 14, fontWeight: 500 }}>Pangan Nusantara</span>
        </div>
        <h1 style={{ color: "#E8F0E0", fontSize: 28, fontWeight: 500, lineHeight: 1.2, margin: "0 0 0.5rem" }}>
          Lahan yang tepat,{" "}
          <span style={{ color: "#A8C878" }}>pangan yang kuat.</span>
        </h1>
        <p style={{ color: "#8FAF78", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
          Masukkan kondisi lahanmu untuk mendapatkan rekomendasi komoditas pangan
          berbasis logika fuzzy Mamdani.
        </p>
      </div>

      {/* ── Input Panel ── */}
      <div style={{
        background: "#fff",
        border: "0.5px solid #ddd",
        borderTop: "none",
        padding: "1.5rem",
        borderRadius: "0 0 14px 14px",
      }}>
        <p style={{
          fontSize: 11, color: "#aaa", textAlign: "center",
          textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1rem",
        }}>
          Kondisi lahanmu
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1.25rem" }}>
          <SliderCard
            icon="🌡️" label="Suhu Udara" id="suhu"
            min={0} max={50} step={1} value={suhu} unit="°C"
            displayValue={suhu}
            onChange={setSuhu}
          />
          <SliderCard
            icon="🌧️" label="Curah Hujan" id="hujan"
            min={200} max={6000} step={50} value={hujan} unit="mm"
            displayValue={hujan}
            onChange={setHujan}
          />
          <SliderCard
            icon="🧪" label="pH Tanah" id="ph"
            min={3.5} max={10} step={0.1} value={ph} unit=""
            displayValue={ph.toFixed(1)}
            onChange={setPh}
          />
          <SliderCard
            icon="⛰️" label="Ketinggian" id="alt"
            min={0} max={3000} step={10} value={alt} unit="mdpl"
            displayValue={alt}
            onChange={setAlt}
          />
        </div>

        <button
          onClick={handleAnalyze}
          style={{
            width: "100%", padding: "0.875rem",
            background: "#2D4A2D", color: "#E8F0E0",
            border: "none", borderRadius: 10,
            fontSize: 14, fontWeight: 500, cursor: "pointer",
          }}
        >
          Analisis Lahan Saya
        </button>

        {/* ── Results ── */}
        {results && (
          <div style={{ marginTop: "1.25rem" }}>
            <div style={{ marginBottom: "1rem" }}>
              <p style={{
                fontSize: 11, color: "#aaa", textTransform: "uppercase",
                letterSpacing: "0.08em", margin: "0 0 4px",
              }}>
                Analisis selesai
              </p>
              <p style={{ fontSize: 13, color: "#666", margin: 0 }}>
                Suhu {suhu}°C · Hujan {hujan}mm · pH {ph.toFixed(1)} · {alt}mdpl
              </p>
            </div>

            <TopResultCard result={results[0]} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {results.slice(1, 3).map((r, i) => (
                <AltResultCard key={r.key} result={r} rank={i + 2} />
              ))}
            </div>

            <button
              onClick={handleReset}
              style={{
                width: "100%", marginTop: "0.875rem",
                padding: "0.75rem", background: "transparent",
                color: "#888", border: "0.5px solid #ddd",
                borderRadius: 10, fontSize: 13, cursor: "pointer",
              }}
            >
              ⚙️ Coba parameter lain
            </button>
          </div>
        )}
      </div>
    </div>
  );
}