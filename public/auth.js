// ----------------------
// Redirect if NOT logged in
// ----------------------
function requireAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
  }
}

// ----------------------
// Redirect AWAY if already logged in
// ----------------------
function redirectIfAuthed() {
  const token = localStorage.getItem("token");
  if (token) {
    window.location.href = "index.html#events";
  }
}

// ----------------------
// LOGIN HANDLER
// ----------------------
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Login failed");
    return;
  }

  // Save token + user
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  // Redirect
  window.location.href = "index.html#events";
}

// ----------------------
// SIGNUP HANDLER
// ----------------------
async function handleSignup(e) {
  e.preventDefault();

  const email = document.getElementById("signup-email").value;
  const username = document.getElementById("signup-username").value;
  const password = document.getElementById("signup-password").value;

  const res = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, username, password })
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error || "Account creation failed");
    return;
  }

  // Save token + user
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  // Redirect
  window.location.href = "index.html#events";
}

// ----------------------
// Attach listeners if forms exist
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);

  const signupForm = document.getElementById("signup-form");
  if (signupForm) signupForm.addEventListener("submit", handleSignup);
});

