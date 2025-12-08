// auth.js

// ----------------------
// Helpers
// ----------------------
function getToken() {
  return localStorage.getItem("token");
}

function getUser() {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ----------------------
// Redirect if NOT logged in
// ----------------------
function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = "login.html";
  }
}

// ----------------------
// Redirect AWAY if already logged in
// (used on login/create-account pages)
// ----------------------
function redirectIfAuthed() {
  const token = getToken();
  if (token) {
    window.location.href = "index.html#events";
  }
}

// ----------------------
// LOGOUT
// ----------------------
function logout() {
  // Clear all auth-related data
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // (Optional) clear anything else you may store later:
  // localStorage.removeItem("someOtherKey");

  // Send user back to login
  window.location.href = "login.html";
}

// ----------------------
// Wire up logout button (if present)
// ----------------------
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
});

