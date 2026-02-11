import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

// sourcery skip: avoid-function-declarations-in-blocks
    async function onSubmit(e) {
        e.preventDefault();
        setError("");

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();
        if (!res.ok) {
            setError(data.error || "Registration failed");
            return;
        }

        localStorage.setItem("token", data.token);
        navigate("/listings");
    }

    return (
        <div className="auth-container">
            <h2>Register</h2>
            {error && <p className="error-text">{error}</p>}

            <form onSubmit={onSubmit}>
                <input
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
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
                <button type="submit">Create Account</button>
            </form>   
        <p>
            Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}
