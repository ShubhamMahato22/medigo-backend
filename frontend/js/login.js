 // =====================================================
    // Login Page Script
    // Handles form submission and sends data to the backend API
    // =====================================================

    // Get references to the form and message box
    const loginForm = document.getElementById("login-form");
    const loginMessage = document.getElementById("login-message");

    // Function to show a message to the user
    function showMessage(type, text) {
      loginMessage.className = "message " + type; // 'success' or 'error'
      loginMessage.textContent = text;
      loginMessage.style.display = "block"; // Make it visible
    }

    // Listen for the form's submit event
    loginForm.addEventListener("submit", async function (event) {
      // Prevent the page from reloading (default form behavior)
      event.preventDefault();

      // Get the values the user typed in
      const email = document.getElementById("login-email").value;
      const password = document.getElementById("login-password").value;

      try {
        // Send a POST request to the backend login API
        const response = await fetch("https://medigo-backend-bljr.onrender.com/api/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // We're sending JSON data
          },
          body: JSON.stringify({ email, password }), // Convert object to JSON string
        });

        // Parse the JSON response from the server
        const data = await response.json();

        if (data.success) {
          // Show success message
          showMessage("success", "✅ Login successful! Redirecting...");

          // Save user info in localStorage (simple session management)
          localStorage.setItem("user", JSON.stringify(data.data));

          // Redirect to home page after 1.5 seconds
          setTimeout(() => {
            window.location.href = "index.html";
          }, 1500);
        } else {
          // Show error message
          showMessage("error", "❌ " + data.message);
        }
      } catch (error) {
        // Network error or server is not running
        showMessage("error", "❌ Could not connect to server. Is the backend running?");
      }
    });

    // ---- Auth: show user icon or Login/Register ----
    (function () {
      const authSection = document.getElementById("auth-section");
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        authSection.innerHTML = `<a href="dashboard.html" title="My Account" style="font-size:1.4rem; line-height:1;">👤</a>`;
      } else {
        authSection.innerHTML = `
          <a href="login.html" class="active">Login</a>
          <a href="register.html" class="btn btn-primary" style="margin-left:8px;">Register</a>`;
      }
    })();