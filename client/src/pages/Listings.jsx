import { useEffect, useState } from "react";

export default function Listings() {
    const [listings, setListings] = useState([]);
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState("");
    const [actionError, setActionError] = useState("");
    const [requestedIds, setRequestedIds] = useState([]);

    const token = localStorage.getItem("token");

    async function load() {
        setError("");
        const res = await fetch("/api/listings");
        const data = await res.json();
        if (!res.ok) return setError(data.error || "Failed to load listings");
        setListings(data);

        if (token) {
            const meRes = await fetch("/api/users/me", { headers: { Authorization: `Bearer ${token}` } });
            const meData = await meRes.json();
            if (meRes.ok) setUserId(meData.user.id);
        }
    }

    useEffect(() => {
        (async () => {
            await load();
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    async function requestTrade(listingId) {
        setActionError("");
        if (!token) return setActionError("Please login first.");

        const res = await fetch("/api/trades", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ requestListingId: listingId })
        });
        const data = await res.json();
        if (!res.ok) return setActionError(data.error || "Failed to request trade");

        setRequestedIds((ids) => [...ids, listingId]);
        load();
    }

    return (
        <div className="page">
            <h2>Browse Listings</h2>

            {error && <p className="error-text">{error}</p>}
            {actionError && <p className="error-text">{actionError}</p>}

            <div className="card-grid">
                {listings.map((l) => {
                    const isOwnListing = userId && l.seller?.id === userId;
                    const alreadyRequested = requestedIds.includes(l.id);
                    return (
                        <div key={l.id} className="card">
                            <div><b>Event:</b> {l.event?.name}</div>
                            <div><b>Seat:</b> {l.ticket?.seat}</div>
                            <div><b>Category:</b> {l.category}</div>
                            <div><b>Status:</b> {l.status}</div>

                            {!isOwnListing && (
                                <div className="card-actions">
                                    <button onClick={() => requestTrade(l.id)} disabled={alreadyRequested}>
                                        {alreadyRequested ? "Requested" : "Request Trade"}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
                {!error && listings.length === 0 && <p>No open listings yet.</p>}
            </div>
        </div>
    );
}
