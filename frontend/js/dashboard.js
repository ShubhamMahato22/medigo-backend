 /*
         dashboard
         1. Guard: redirect to login if not logged in
         2. Populate profile from localStorage
         3. Fetch & filter orders from API
         4. Sidebar tab switching
         5. Logout
 */

      const API_BASE ="https://medigo-backend-bljr.onrender.com";

     
      // 1. Guard: must be logged in
    
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        window.location.href = "login.html";
      }


      // 2. Auth navbar

      (function () {
        const authSection = document.getElementById("auth-section");
        if (user) {
          authSection.innerHTML = `<a href="dashboard.html" title="My Account" style="font-size:1.4rem; line-height:1; color:var(--primary);">👤</a>`;
        } else {
          authSection.innerHTML = `
            <a href="login.html">Login</a>
            <a href="register.html" class="btn btn-primary" style="margin-left:8px;">Register</a>`;
        }
      })();

    
      // 3. Populate profile

      function populateProfile() {
        if (!user) return;

        // Sidebar avatar
        const initials = (user.name || "U")
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        document.getElementById("avatar-initials").textContent = initials;
        document.getElementById("sidebar-name").textContent = user.name || "—";
        document.getElementById("sidebar-email").textContent = user.email || "";

        // Profile panel
        document.getElementById("profile-name").textContent = user.name || "—";
        document.getElementById("profile-email").textContent =
          user.email || "—";
        document.getElementById("profile-phone").textContent =
          user.phone || "—";
        document.getElementById("profile-address").textContent =
          user.address || "—";
        document.getElementById("profile-role").textContent = user.role
          ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
          : "Customer";
      }

      populateProfile();

     
      // 4. Sidebar panel switching
   
      function showPanel(panel) {
        // Hide all panels
        document
          .querySelectorAll(".dash-panel")
          .forEach((el) => el.classList.remove("active"));
        // Remove active from nav items
        document
          .querySelectorAll(".sidebar-nav-item")
          .forEach((el) => el.classList.remove("active"));

        // Show selected panel
        document.getElementById("panel-" + panel).classList.add("active");
        document.getElementById("nav-" + panel).classList.add("active");

        // Lazy-load orders only when that tab is first opened
        if (panel === "orders" && !ordersLoaded) {
          fetchOrders();
        }
      }

    
      // 5. Fetch and display orders

      let ordersLoaded = false;

      const ordersLoadingEl = document.getElementById("orders-loading");
      const ordersEmptyEl = document.getElementById("orders-empty");
      const ordersErrorEl = document.getElementById("orders-error");
      const ordersListEl = document.getElementById("orders-list");

      function getStatusClass(status) {
        const map = {
          pending: "status-pending",
          confirmed: "status-confirmed",
          shipped: "status-confirmed",
          delivered: "status-delivered",
          cancelled: "status-cancelled",
        };
        return map[(status || "").toLowerCase()] || "status-pending";
      }

      function getStatusLabel(status) {
        const map = {
          pending: "Order Placed",
          confirmed: "Confirmed",
          shipped: "Shipped",
          out_for_delivery: "Out for Delivery",
          delivered: "Delivered",
          cancelled: "Cancelled",
        };
        return map[(status || "").toLowerCase()] || "Order Placed";
      }

      function renderOrders(orders) {
        ordersLoaded = true;
        ordersLoadingEl.style.display = "none";

        if (orders.length === 0) {
          ordersEmptyEl.style.display = "block";
          return;
        }

        ordersListEl.innerHTML = "";

        orders.forEach((order) => {
          const statusClass = getStatusClass(order.status);
          const statusLabel = getStatusLabel(order.status);

          // Build medicine pills
          const itemsHtml = (order.items || [])
            .map((item) => {
              const medName =
                item.medicine?.name ||
                (typeof item.medicine === "string" ? "Medicine" : "Medicine");
              const qty = item.quantity || 1;
              return `<span class="order-item-pill">${medName} <span class="pill-qty">× ${qty}</span></span>`;
            })
            .join("");

          const rawStatus = (order.status || "pending").toLowerCase();

          let timelineHtml = "";
          if (rawStatus === "cancelled") {
            timelineHtml = `<div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid var(--border); color: var(--danger); font-weight: 600; text-align: center;">❌ Cancelled</div>`;
          } else {
            const steps = [
              "pending",
              "confirmed",
              "shipped",
              "out_for_delivery",
              "delivered",
            ];
            const icons = ["📦", "✔", "🚚", "🏠", "✅"];
            const currentIdx =
              steps.indexOf(rawStatus) >= 0 ? steps.indexOf(rawStatus) : 0;

            let stepsHtml = "";
            steps.forEach((step, idx) => {
              let classes = "step";
              if (idx < currentIdx) classes += " completed";
              else if (idx === currentIdx) classes += " active";
              stepsHtml += `
                  <div class="${classes}">
                    <span>${icons[idx]}</span>
                    <small>${getStatusLabel(step)}</small>
                  </div>
                `;
            });
            timelineHtml = `<div class="timeline">${stepsHtml}</div>`;
          }

          const card = document.createElement("div");
          card.className = "order-card";
          card.innerHTML = `
            <div class="order-top">
              <span class="order-id">ID: ${order._id}</span>
              <div class="order-meta">
                <span class="order-amount">₹${order.totalAmount}</span>
                <span class="order-status ${statusClass}">${statusLabel}</span>
              </div>
            </div>
            ${
              itemsHtml
                ? `<p class="order-items-label">Medicines</p>
                   <div class="order-items-list">${itemsHtml}</div>`
                : ""
            }
            ${timelineHtml}
          `;
          ordersListEl.appendChild(card);
        });
      }

      async function fetchOrders() {
        ordersLoadingEl.style.display = "block";
        ordersEmptyEl.style.display = "none";
        ordersErrorEl.style.display = "none";
        ordersListEl.innerHTML = "";

        try {
          const res = await fetch(`${API_BASE}/api/orders`);
          const result = await res.json();

          if (!result.success) throw new Error(result.message || "API error");

          // Filter only orders belonging to the logged-in user
          const myOrders = (result.data || []).filter(
            (order) => order.user === user._id || order.user?._id === user._id,
          );

          renderOrders(myOrders);
        } catch (err) {
          ordersLoaded = false; // allow retry
          ordersLoadingEl.style.display = "none";
          ordersErrorEl.style.display = "block";
          console.error("Orders fetch error:", err);
        }
      }

      // 6. Logout
      
      function logout() {
        if (confirm("Are you sure you want to logout?")) {
          localStorage.removeItem("user");
          window.location.href = "login.html";
        }
      }