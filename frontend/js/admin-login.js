

const API_BASE = "https://medigo-backend-bljr.onrender.com";
const token = localStorage.getItem("adminToken");
// ---- Guard: redirect if already logged in as admin ----
if (token) {
  window.location.href = "admin-dashboard.html";
}

// ---- DOM ----
const form = document.getElementById("admin-login-form");
const msgEl = document.getElementById("admin-msg");

function showMsg(type, text) {
  msgEl.className = "message " + type;
  msgEl.textContent = text;
  msgEl.style.display = "block";
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document
    .getElementById("admin-email")
    .value.trim()
    .toLowerCase();
  const password = document.getElementById("admin-password").value;
  const btn = form.querySelector('button[type="submit"]');

  try {
    btn.disabled = true;
    btn.textContent = "Logging in...";

    const response = await fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      // Correct — store admin session and redirect
      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("adminUser", JSON.stringify(data));
      showMsg("success", "✅ Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "admin-dashboard.html";
      }, 900);
    } else {
      showMsg("error", "❌ " + (data.message || "Invalid email or password."));
      document.getElementById("admin-password").value = "";
    }
  } catch (error) {
    showMsg("error", "❌ Network error. Please try again.");
    console.error("Login error:", error);
  } finally {
    btn.disabled = false;
    btn.textContent = "Login to Dashboard →";
  }
});
