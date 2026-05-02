"use client";

import { useState } from "react";

type HistoryItem = {
  message: string;
  category?: string;
  response?: string;
};

export default function Home() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<any>(null);
  const [tone, setTone] = useState("pro");

  // ✅ FIX PROPRE (plus de never / any problem)
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!message) return;

    setLoading(true);

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message, tone }),
    });

    const data = await res.json();

    setResult(data);

    // ✅ SAFE UPDATE (évite bugs React + TS)
    setHistory((prev) => [
      { message, ...data },
      ...prev
    ]);

    setLoading(false);
  };

  // ✅ SAFE COPY (plus d’erreur null)
  const copyToClipboard = () => {
    if (!result?.response) return;
    navigator.clipboard.writeText(result.response);
  };

  const reset = () => {
    setMessage("");
    setResult(null);
  };

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f4f6f8"
    }}>
      <div style={{
        width: 650,
        background: "white",
        padding: 30,
        borderRadius: 12,
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
      }}>
        <h1 style={{ marginBottom: 5 }}>Inbox AI</h1>

        <p style={{ color: "#666", marginBottom: 20 }}>
          Gagne du temps en répondant automatiquement à tes clients
        </p>

        <textarea
          rows={4}
          style={{
            width: "100%",
            padding: 12,
            borderRadius: 8,
            border: "1px solid #ddd"
          }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Colle un message client ici..."
        />

        <br /><br />

        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 8
          }}
        >
          <option value="pro">Professionnel</option>
          <option value="friendly">Amical</option>
          <option value="sales">Vendeur</option>
        </select>

        <br /><br />

        <button
          onClick={handleAnalyze}
          style={{
            width: "100%",
            padding: 14,
            background: "black",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          {loading ? "Analyse en cours..." : "Analyser"}
        </button>

        <br /><br />

        {result && (
          <div style={{
            background: "#f9fafb",
            padding: 20,
            borderRadius: 10,
            border: "1px solid #eee"
          }}>
            <div style={{ marginBottom: 10 }}>
              <strong>📂 Catégorie :</strong>{" "}
              <span style={{
                background: "#eee",
                padding: "4px 8px",
                borderRadius: 6
              }}>
                {result.category}
              </span>
            </div>

            <div>
              <strong>✉️ Réponse :</strong>
              <p style={{ marginTop: 5 }}>{result.response}</p>
            </div>

            <br />

            <button onClick={copyToClipboard} style={{ marginRight: 10 }}>
              📋 Copier
            </button>

            <button onClick={reset}>
              🔄 Nouveau message
            </button>
          </div>
        )}

        <hr style={{ margin: "30px 0" }} />

        <h3>Historique</h3>

        {history.length === 0 && <p>Aucun message pour l’instant</p>}

        {history.map((item, index) => (
          <div key={index} style={{
            background: "#f1f1f1",
            padding: 10,
            borderRadius: 6,
            marginTop: 10
          }}>
            <strong>{item.category}</strong> — {item.message}
          </div>
        ))}
      </div>
    </main>
  );
}