import { useEffect, useState } from "react";

export default function Trades() {
  const [trades, setTrades] = useState([]);
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const token = localStorage.getItem("token");

  async function loadTrades() {
    setError("");
    if (!token) return setError("Please login first.");

    const [tradesRes, meRes] = await Promise.all([
      fetch("/api/trades/me", { headers: { Authorization: `Bearer ${token}` } }),
      fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` } })
    ]);

    const tradesData = await tradesRes.json();
    if (!tradesRes.ok) return setError(tradesData.error || "Failed to load trades");

    const meData = await meRes.json();
    if (meRes.ok) setUserId(meData.user.id);

    setTrades(tradesData);
  }

  useEffect(() => {
    (async () => {
      await loadTrades();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function respond(tradeId, action) {
    setActionError("");
    const res = await fetch(`/api/trades/${tradeId}/${action}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) return setActionError(data.error || `Failed to ${action} trade`);
    loadTrades();
  }

  return (
    <div className="page">
      <h2>My Trades</h2>
      {error && <p className="error-text">{error}</p>}
      {actionError && <p className="error-text">{actionError}</p>}

      <div className="card-grid">
        {trades.map((t) => {
          const isSeller = userId && t.sellerId === userId;
          return (
            <div key={t.id} className="card">
              <div><b>Trade:</b> {t.tradeCode}</div>
              <div><b>Event:</b> {t.requestListing?.event?.name}</div>
              <div><b>Seat:</b> {t.requestListing?.ticket?.seat}</div>
              <div><b>Status:</b> {t.status}</div>

              {isSeller && t.status === "pending" && (
                <div className="card-actions">
                  <button onClick={() => respond(t.id, "accept")}>Accept</button>
                  <button className="secondary" onClick={() => respond(t.id, "decline")}>Decline</button>
                </div>
              )}
            </div>
          );
        })}
        {!error && trades.length === 0 && <p>No trades yet.</p>}
      </div>
    </div>
  );
}
