import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateListing() {
    const [category, setCategory] = useState("student");
    const [event, setEvent] = useState("");
    const [seat, setSeat] = useState("");
    const [ticketNumber, setTicketNumber] = useState("");
    const [preferredTrade, setPreferredTrade] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

// sourcery skip: avoid-function-declarations-in-blocks
    async function onSubmit(e) {
        e.preventDefault();
        setError("");

        const token = localStorage.getItem("token");
        if (!token) return setError("Please login first.");

        const res = await fetch("/api/listings", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ category, event, seat, ticketNumber, preferredTrade })
        });

        const data = await res.json();
        if (!res.ok) return setError(data.error || "Failed to create listing");

        navigate("/listings");
        }

        return (
        <div style={{ padding: 16 }}>
            <h2>Create Listing</h2>
            {error && <p className="error-text">{error}</p>}

            <form onSubmit={onSubmit}>
                <input placeholder="Event name" value={event} onChange={(e) => setEvent(e.target.value)} required />
                <input placeholder="Seat (must match registry)" value={seat} onChange={(e) => setSeat(e.target.value)} required />
                <input placeholder="Ticket Number" value={ticketNumber} onChange={(e) => setTicketNumber(e.target.value)} required />
                <input placeholder="Preferred Trade (optional)" value={preferredTrade} onChange={(e) => setPreferredTrade(e.target.value)} />
                <button type="submit">Create</button>
            </form>
        </div>
    );
}
