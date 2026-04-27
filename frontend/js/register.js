
    // Register Page Script
    // Collects form data and sends it to the backend API

    const registerForm = document.getElementById("register-form");
    const registerMessage = document.getElementById("register-message");

    // Helper function to show messages
    function showMessage(type, text) {
      registerMessage.className = "message " + type;
      registerMessage.textContent = text;
      registerMessage.style.display = "block";
    }

    // Listen for form submission
    registerForm.addEventListener("submit", async function (event) {
      event.preventDefault(); // Prevent default page reload

      // Gather all form field values
      const name = document.getElementById("reg-name").value;
      const email = document.getElementById("reg-email").value;
      const phone = document.getElementById("reg-phone").value;
      const address = document.getElementById("reg-address").value;
      const password = document.getElementById("reg-password").value;

      // Basic client-side validation
      if (password.length < 6) {
        showMessage("error", "❌ Password must be at least 6 characters.");
        return; // Stop here, don't submit
      }

      try {
        // Send POST request to the backend register endpoint
        const response = await fetch("https://medigo-backend-bljr.onrender.com/api/users/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, phone, address, password }),
        });

        const data = await response.json();

        if (data.success) {
          showMessage("success", "✅ Account created! Redirecting to login...");
          // Redirect to login after 2 seconds
          setTimeout(() => {
            window.location.href = "login.html";
          }, 2000);
        } else {
          showMessage("error", "❌ " + data.message);
        }
      } catch (error) {
        showMessage("error", "❌ Server not reachable. Please try again.");
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
          <a href="login.html">Login</a>
          <a href="register.html" class="btn btn-primary active" style="margin-left:8px;">Register</a>`;
      }
    })();