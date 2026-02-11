import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

// sourcery skip: avoid-function-declarations-in-blocks
    async function onSubmit(e) {
        e.preventDefault();
        setError("");

        const res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
    });

        const data = await res.json();
        if (!res.ok) {
            setError(data.error || "Login failed");
            return;
        }

        localStorage.setItem("token", data.token);
        navigate("/listings");
    }

    return (
        <div className="auth-container">
            <h2>Login</h2>
            {error && <p className="error-text">{error}</p>}

            <form onSubmit={onSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>

            <p>
                Don&apos;t have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
}
