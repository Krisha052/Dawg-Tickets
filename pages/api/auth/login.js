import { signIn } from "next-auth/react";
import { useState } from "react";

export default function Login() {
  const [theEmailOrUsername, setTheEmailOrUsername] = useState("");
  const [thePassword, setThePassword] = useState("");

  async function theHandleSubmit(theEvent) {
    theEvent.preventDefault();

    await signIn("credentials", {
      theEmailOrUsername,
      thePassword,
      callbackUrl: "/dashboard"
    });
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Login</h2>
        <form onSubmit={theHandleSubmit}>
          <input
            type="text"
            placeholder="Email or Username"
            value={theEmailOrUsername}
            onChange={(theEvent) => setTheEmailOrUsername(theEvent.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={thePassword}
            onChange={(theEvent) => setThePassword(theEvent.target.value)}
            required
          />
          <button type="submit" className="auth-btn">Log In</button>
        </form>
      </div>
    </div>
  );
}
