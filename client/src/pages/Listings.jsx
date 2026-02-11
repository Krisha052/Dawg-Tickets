import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function Listings() {
    const [listings, setListings] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            setError("");
            const res = await fetch("/api/listings");
            const data = await res.json();
            if (!res.ok) return setError(data.error || "Failed to load listings");
            setListings(data);
        })();
    }, []);

    return (
        <div style={{ padding: 16 }}>
            <h2>Browse Listings</h2>
            <div style={{ marginBottom: 12 }}>
                <Link to="/create-listing">Create Listing</Link>{" "}
                | <Link to="/trades">My Trades</Link>{" "}
                | <Link to="/admin">Admin</Link>{" "}
                | <Link to="/login">Login</Link>
            </div>

            {error && <p className="error-text">{error}</p>}

            {listings.map((l) => (
                <div key={l.id} style={{ border: "1px solid #ddd", padding: 12, marginBottom: 8 }}>
                    <div><b>Event:</b> {l.event?.name}</div>
                    <div><b>Seat:</b> {l.ticket?.seat}</div>
                    <div><b>Category:</b> {l.category}</div>
                    <div><b>Status:</b> {l.status}</div>
                </div>
            ))}
        </div>
    );
}
