  /* ==============================================
         checkout.html — JavaScript
         1. Guard: cart must not be empty, user must be logged in
         2. Compute and show delivery date
         3. Render order items + price summary
         4. Address pre-fill from localStorage
         5. confirmOrder() → POST /api/orders
         6. Show success overlay
      ============================================== */

      const API_BASE = "http://localhost:5000";

      // -----------------------------------------------
      // 1. Load data from localStorage
      // -----------------------------------------------
      const user = JSON.parse(localStorage.getItem("user"));
      const cart = JSON.parse(localStorage.getItem("cart")) || [];

      // Guard — redirect if no user or empty cart
      if (!user) { window.location.href = "login.html"; }
      if (cart.length === 0) { window.location.href = "cart.html"; }

      // Auth navbar
      (function () {
        const authSection = document.getElementById("auth-section");
        if (user) {
          authSection.innerHTML = `<a href="dashboard.html" title="My Account" style="font-size:1.4rem; line-height:1;">👤</a>`;
        } else {
          authSection.innerHTML = `<a href="login.html">Login</a>
            <a href="register.html" class="btn btn-primary" style="margin-left:8px;">Register</a>`;
        }
      })();

      // -----------------------------------------------
      // 2. Delivery date (2–5 days from today)
      // -----------------------------------------------
      function getDeliveryDate() {
        const days      = Math.floor(Math.random() * 4) + 2; // 2–5
        const date      = new Date();
        date.setDate(date.getDate() + days);
        const weekdays  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const months    = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        return `${weekdays[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
      }

      const deliveryDateStr = getDeliveryDate();
      document.getElementById("delivery-date").textContent       = deliveryDateStr;
      document.getElementById("success-delivery-date").textContent = "🚚 Delivery by " + deliveryDateStr;

      // -----------------------------------------------
      // 3. Render order items
      // -----------------------------------------------
      function renderItems() {
        const list = document.getElementById("order-items-list");
        document.getElementById("item-count").textContent = cart.length + " item" + (cart.length !== 1 ? "s" : "");

        list.innerHTML = cart.map((item) => {
          const subtotal = (item.price * item.quantity).toFixed(2);
          return `
            <div class="order-item-row">
              <span class="item-name">${item.name}</span>
              <span class="item-qty">× ${item.quantity}</span>
              <span class="item-price">₹${subtotal}</span>
            </div>
          `;
        }).join("");
      }

      // -----------------------------------------------
      // 4. Render price summary
      // -----------------------------------------------
      function renderPriceSummary() {
        const subtotal   = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
        const shipping   = 0;   // free
        const discount   = 0;
        const total      = subtotal + shipping - discount;

        document.getElementById("price-summary").innerHTML = `
          <div class="price-row">
            <span>Subtotal (${cart.length} item${cart.length !== 1 ? "s" : ""})</span>
            <span>₹${subtotal.toFixed(2)}</span>
          </div>
          <div class="price-row">
            <span>Delivery Charges</span>
            <span class="discount">FREE</span>
          </div>
          <div class="price-row total">
            <span>Total Amount</span>
            <span class="price-val">₹${total.toFixed(2)}</span>
          </div>
        `;

        return total;
      }

      renderItems();
      const orderTotal = renderPriceSummary();

      // -----------------------------------------------
      // 5. Pre-fill address from localStorage
      // -----------------------------------------------
      const savedAddress = JSON.parse(localStorage.getItem("address") || "null");
      if (savedAddress) {
        if (savedAddress.name)    document.getElementById("addr-name").value    = savedAddress.name;
        if (savedAddress.street)  document.getElementById("addr-street").value  = savedAddress.street;
        if (savedAddress.city)    document.getElementById("addr-city").value    = savedAddress.city;
        if (savedAddress.state)   document.getElementById("addr-state").value   = savedAddress.state;
        if (savedAddress.pincode) document.getElementById("addr-pincode").value = savedAddress.pincode;
        if (savedAddress.phone)   document.getElementById("addr-phone").value   = savedAddress.phone;
      } else if (user.address) {
        // Pre-fill from user profile if available
        document.getElementById("addr-street").value = user.address;
      }
      if (user.name)  document.getElementById("addr-name").value  = document.getElementById("addr-name").value  || user.name;
      if (user.phone) document.getElementById("addr-phone").value = document.getElementById("addr-phone").value || user.phone;

      // -----------------------------------------------
      // 6. Confirm Order
      // -----------------------------------------------
      async function confirmOrder() {
        const errorEl = document.getElementById("addr-error");
        errorEl.style.display = "none";

        // Collect + validate address
        const name    = document.getElementById("addr-name").value.trim();
        const street  = document.getElementById("addr-street").value.trim();
        const city    = document.getElementById("addr-city").value.trim();
        const state   = document.getElementById("addr-state").value.trim();
        const pincode = document.getElementById("addr-pincode").value.trim();
        const phone   = document.getElementById("addr-phone").value.trim();

        // Field validation
        const required = [
          { val: name,    id: "addr-name",    label: "Full Name" },
          { val: street,  id: "addr-street",  label: "Street/Locality" },
          { val: city,    id: "addr-city",    label: "City" },
          { val: pincode, id: "addr-pincode", label: "Pincode" },
        ];

        // Clear previous error highlights
        required.forEach(f => document.getElementById(f.id).classList.remove("error-field"));

        const missing = required.filter(f => !f.val);
        if (missing.length > 0) {
          missing.forEach(f => document.getElementById(f.id).classList.add("error-field"));
          errorEl.textContent  = "❌ Please fill in: " + missing.map(f => f.label).join(", ");
          errorEl.style.display = "block";
          document.getElementById("addr-name").focus();
          return;
        }

        if (!/^\d{6}$/.test(pincode)) {
          document.getElementById("addr-pincode").classList.add("error-field");
          errorEl.textContent  = "❌ Pincode must be exactly 6 digits.";
          errorEl.style.display = "block";
          return;
        }

        // Build and save address string
        const addressData = { name, street, city, state, pincode, phone };
        localStorage.setItem("address", JSON.stringify(addressData));
        const deliveryAddress = `${name}, ${street}, ${city}${state ? ", " + state : ""} - ${pincode}${phone ? " | Ph: " + phone : ""}`;

        // Filter valid MongoDB IDs from cart
        const validItems = cart.filter(item => item.id && item.id.length === 24);
        if (validItems.length === 0) {
          errorEl.textContent  = "❌ Invalid cart data. Please re-add medicines from the store.";
          errorEl.style.display = "block";
          return;
        }

        const orderPayload = {
          user: user._id,
          items: validItems.map(item => ({
            medicine: item.id,
            quantity:  item.quantity,
          })),
          totalAmount:     orderTotal,
          deliveryAddress: deliveryAddress,
        };

        // Disable button
        const btn = document.getElementById("confirm-btn");
        btn.disabled    = true;
        btn.textContent = "⏳ Placing order...";

        try {
          const res    = await fetch(`${API_BASE}/api/orders`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify(orderPayload),
          });
          const result = await res.json();

          if (result.success) {
            // Clear cart
            localStorage.removeItem("cart");
            // Show success overlay
            document.getElementById("success-overlay").classList.add("show");
          } else {
            errorEl.textContent  = "❌ " + result.message;
            errorEl.style.display = "block";
            btn.disabled    = false;
            btn.innerHTML   = "🚀 Confirm Order";
          }
        } catch (err) {
          errorEl.textContent  = "❌ Server not reachable. Is the backend running?";
          errorEl.style.display = "block";
          btn.disabled    = false;
          btn.innerHTML   = "🚀 Confirm Order";
        }
      }