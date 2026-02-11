import { useEffect, useState } from "react";

export default function Admin() {
  const [trades, setTrades] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      setError("");
      const token = localStorage.getItem("token");
      if (!token) return setError("Please login first.");

      const res = await fetch("/api/trades/admin/all", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok) return setError(data.error || "Admin access required.");

      setTrades(data);
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Admin Moderation</h2>
      {error && <p className="error-text">{error}</p>}

      {trades.map((t) => (
        <div key={t.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 8 }}>
          <div><b>Trade:</b> {t.tradeCode}</div>
          <div><b>Status:</b> {t.status}</div>
        </div>
      ))}
    </div>
  );
}
