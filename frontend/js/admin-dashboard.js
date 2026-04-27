/*
         admin-dashboard
         1. Guard: redirect if not admin
         2. Sidebar panel switching
         3. Add Medicine → POST /api/medicines
         4. Manage Orders → GET /api/orders
         5. Accept / Cancel → PUT /api/orders/:id
         6. Logout
  */

const API_BASE = "https://medigo-backend-bljr.onrender.com";


// 1. Guard

const token = localStorage.getItem("adminToken");

if (!token) {
  window.location.href = "admin-login.html";
} else {
  const user = JSON.parse(localStorage.getItem("adminUser"));

  const nameEl = document.getElementById("admin-nav-name");
  if (nameEl) {
    nameEl.textContent = "👤 " + (user && user.email ? user.email : "Admin");
  }
}


// 2. Sidebar switching

function showPanel(panel) {
  document
    .querySelectorAll(".dash-panel")
    .forEach((el) => el.classList.remove("active"));
  document
    .querySelectorAll(".admin-nav-item")
    .forEach((el) => el.classList.remove("active"));
  document.getElementById("panel-" + panel).classList.add("active");
  document.getElementById("nav-" + panel).classList.add("active");

  if (panel === "orders") fetchOrders();
  if (panel === "manage-med") fetchMedicinesAdmin();
}


// 3. Toast

let toastTimer;
function showToast(msg) {
  const el = document.getElementById("toast");
  document.getElementById("toast-msg").textContent = msg;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2800);
}


// 4. Message boxes

function showMsg(id, type, text) {
  const el = document.getElementById(id);
  el.className = "message " + type;
  el.textContent = text;
  el.style.display = "block";
  setTimeout(() => {
    el.style.display = "none";
  }, 4000);
}

// 5. Add Medicine

const addMedForm = document.getElementById("add-medicine-form");

addMedForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  const btn = document.getElementById("add-med-btn");
  btn.disabled = true;
  btn.textContent = "Adding...";

  const payload = {
    name: document.getElementById("med-name").value.trim(),
    description: document.getElementById("med-desc").value.trim(),
    price: parseFloat(document.getElementById("med-price").value),
    stock: parseInt(document.getElementById("med-stock").value) || 100,
    category: document.getElementById("med-category").value.trim(),
    manufacturer: document.getElementById("med-manufacturer").value.trim(),
    imageUrl: document.getElementById("med-image").value.trim(),
  };

  try {
    const res = await fetch(`${API_BASE}/api/medicines`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();

    if (result.success) {
      showMsg("med-msg", "success", `✅ "${payload.name}" added successfully!`);
      addMedForm.reset();
      document.getElementById("med-stock").value = "100";
    } else {
      showMsg("med-msg", "error", "❌ " + result.message);
    }
  } catch (err) {
    showMsg(
      "med-msg",
      "error",
      "❌ Server not reachable. Is the backend running?",
    );
  } finally {
    btn.disabled = false;
    btn.textContent = " Add Medicine";
  }
});


// 6. Fetch & render all orders

function setOrderState(which) {
  ["orders-loading", "orders-empty", "orders-error"].forEach((id) => {
    const el = document.getElementById(id);
    el.classList.remove("visible");
    el.style.display = "none"; // ← force-hide via style
  });
  if (which) {
    const el = document.getElementById(which);
    el.classList.add("visible");
    el.style.display = "block"; // ← force-show via style
  }
}

function getStatusClass(s) {
  const map = {
    pending: "status-pending",
    confirmed: "status-confirmed",
    shipped: "status-shipped",
    out_for_delivery: "status-shipped",
    delivered: "status-delivered",
    cancelled: "status-cancelled",
  };
  return map[(s || "").toLowerCase()] || "status-pending";
}

function getReadableStatus(s) {
  const map = {
    pending: "Order Placed",
    confirmed: "Confirmed",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return map[(s || "").toLowerCase()] || "Order Placed";
}

async function fetchOrders() {
  setOrderState("orders-loading");
  document.getElementById("admin-orders-list").innerHTML = "";
  document.getElementById("orders-count").textContent = "Loading...";

  try {
    const res = await fetch(`${API_BASE}/api/orders`);
    const result = await res.json();

    // Debug log — check browser console if orders don't appear
    console.log("Orders API response:", result);

    if (!result.success)
      throw new Error(result.message || "API returned success:false");

    // Support both result.data (array) and result itself as array
    const raw = Array.isArray(result.data)
      ? result.data
      : Array.isArray(result)
        ? result
        : [];

    // Sort newest first (createdAt descending)
    const orders = raw
      .slice()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    document.getElementById("orders-count").textContent =
      `${orders.length} order${orders.length !== 1 ? "s" : ""} found`;

    if (orders.length === 0) {
      setOrderState("orders-empty");
      return;
    }
    setOrderState(null);
    renderOrders(orders);
  } catch (err) {
    setOrderState("orders-error");
    document.getElementById("orders-count").textContent = "";
    console.error("fetchOrders error:", err);
  }
}

function renderOrders(orders) {
  const list = document.getElementById("admin-orders-list");
  list.innerHTML = "";

  orders.forEach((order) => {
    const status = (order.status || "pending").toLowerCase();
    const statusClass = getStatusClass(status);
    const statusLabel = getReadableStatus(status);

    const statusFlow = [
      "pending",
      "confirmed",
      "shipped",
      "out_for_delivery",
      "delivered",
    ];
    const currentIndex = statusFlow.indexOf(status);

    const isConfirmEnabled = currentIndex + 1 === 1 && status !== "cancelled";
    const isShipEnabled = currentIndex + 1 === 2 && status !== "cancelled";
    const isOutEnabled = currentIndex + 1 === 3 && status !== "cancelled";
    const isDeliverEnabled = currentIndex + 1 === 4 && status !== "cancelled";
    const isCancelEnabled = status !== "delivered" && status !== "cancelled";

    // Medicine pills
    const pillsHtml = (order.items || [])
      .map((item) => {
        const name = item.medicine?.name || "Medicine";
        const qty = item.quantity || 1;
        return `<span class="order-item-pill">${name} <span style="color:var(--gray); font-size:0.75rem;">× ${qty}</span></span>`;
      })
      .join("");

    // User info
    const userName = order.user?.name || "—";
    const userEmail = order.user?.email || "";

    const card = document.createElement("div");
    card.className = "admin-order-card";
    card.id = "order-card-" + order._id;

    card.innerHTML = `
            <div class="order-top">
              <div class="order-id-block">
                <span class="order-id">ID: ${order._id}</span>
                <span class="order-user-info">👤 ${userName}${userEmail ? " · " + userEmail : ""}</span>
              </div>
              <div class="order-meta">
                <span class="order-amount">₹${order.totalAmount}</span>
                <span class="order-status ${statusClass}" id="status-badge-${order._id}">${statusLabel}</span>
              </div>
            </div>
            ${pillsHtml ? `<p class="order-items-label">Medicines</p><div class="order-items-list">${pillsHtml}</div>` : ""}
            <div class="order-actions" style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn-accept" id="btn-confirm-${order._id}" onclick="updateOrderStatus('${order._id}', 'confirmed')" ${!isConfirmEnabled ? "disabled title='Complete previous step first'" : ""}>
                Confirm
              </button>
              <button class="btn-accept" id="btn-ship-${order._id}" onclick="updateOrderStatus('${order._id}', 'shipped')" ${!isShipEnabled ? "disabled title='Complete previous step first'" : ""}>
                Ship
              </button>
              <button class="btn-accept" id="btn-out-${order._id}" onclick="updateOrderStatus('${order._id}', 'out_for_delivery')" ${!isOutEnabled ? "disabled title='Complete previous step first'" : ""}>
                Out for Delivery
              </button>
              <button class="btn-accept" id="btn-deliver-${order._id}" onclick="updateOrderStatus('${order._id}', 'delivered')" ${!isDeliverEnabled ? "disabled title='Complete previous step first'" : ""}>
                Deliver
              </button>
              <button class="btn-cancel-order" id="btn-cancel-${order._id}" onclick="updateOrderStatus('${order._id}', 'cancelled')" ${!isCancelEnabled ? "disabled" : ""}>
                Cancel
              </button>
            </div>
          `;

    list.appendChild(card);
  });
}


// 7. Update order status

async function updateOrderStatus(orderId, newStatus) {
  const orderCard = document.getElementById("order-card-" + orderId);
  const buttons = orderCard
    ? orderCard.querySelectorAll(".order-actions button")
    : [];
  buttons.forEach((btn) => (btn.disabled = true));

  try {
    const res = await fetch(`${API_BASE}/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const result = await res.json();

    if (result.success) {
      const badge = document.getElementById("status-badge-" + orderId);
      if (badge) {
        badge.className = "order-status " + getStatusClass(newStatus);
        badge.textContent = getReadableStatus(newStatus);
      }

      const statusFlow = [
        "pending",
        "confirmed",
        "shipped",
        "out_for_delivery",
        "delivered",
      ];
      const currentIndex = statusFlow.indexOf(newStatus);

      const btnConfirm = document.getElementById("btn-confirm-" + orderId);
      const btnShip = document.getElementById("btn-ship-" + orderId);
      const btnOut = document.getElementById("btn-out-" + orderId);
      const btnDeliver = document.getElementById("btn-deliver-" + orderId);
      const btnCancel = document.getElementById("btn-cancel-" + orderId);

      if (btnConfirm)
        btnConfirm.disabled = !(
          currentIndex + 1 === 1 && newStatus !== "cancelled"
        );
      if (btnShip)
        btnShip.disabled = !(
          currentIndex + 1 === 2 && newStatus !== "cancelled"
        );
      if (btnOut)
        btnOut.disabled = !(
          currentIndex + 1 === 3 && newStatus !== "cancelled"
        );
      if (btnDeliver)
        btnDeliver.disabled = !(
          currentIndex + 1 === 4 && newStatus !== "cancelled"
        );
      if (btnCancel)
        btnCancel.disabled =
          newStatus === "delivered" || newStatus === "cancelled";

      showToast(`✅ Order status updated to: ${getReadableStatus(newStatus)}`);
    } else {
      showToast("❌ " + result.message);
      buttons.forEach((btn) => (btn.disabled = false));
    }
  } catch (err) {
    showToast("❌ Server error. Try again.");
    buttons.forEach((btn) => (btn.disabled = false));
  }
}


// 8. Logout

function adminLogout() {
  if (confirm("Logout from admin panel?")) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminUser");
    window.location.href = "admin-login.html";
  }
}


// 9. MANAGE MEDICINES — Fetch, Edit, Delete


let medicinesCache = []; // keep a local copy for edit pre-fill

function setMedState(which) {
  ["med-loading", "med-empty", "med-error"].forEach((id) => {
    document.getElementById(id).style.display = "none";
  });
  if (which) document.getElementById(which).style.display = "block";
}

async function fetchMedicinesAdmin() {
  setMedState("med-loading");
  document.getElementById("med-tbody").innerHTML = "";
  document.getElementById("med-count").textContent = "Loading...";

  try {
    const res = await fetch(`${API_BASE}/api/medicines`);
    const result = await res.json();
    if (!result.success) throw new Error(result.message);

    medicinesCache = result.data || [];
    document.getElementById("med-count").textContent =
      `${medicinesCache.length} medicine${medicinesCache.length !== 1 ? "s" : ""} found`;

    if (medicinesCache.length === 0) {
      setMedState("med-empty");
      return;
    }
    setMedState(null);
    renderMedicinesTable(medicinesCache);
  } catch (err) {
    setMedState("med-error");
    document.getElementById("med-count").textContent = "";
    console.error("fetchMedicinesAdmin error:", err);
  }
}

function renderMedicinesTable(medicines) {
  const tbody = document.getElementById("med-tbody");
  tbody.innerHTML = medicines
    .map(
      (m, i) => `
          <tr id="med-row-${m._id}">
            <td style="color:var(--gray); font-size:0.8rem;">${i + 1}</td>
            <td style="font-weight:600;">${m.name}</td>
            <td><span style="background:var(--border); color:var(--primary); font-size:0.75rem; font-weight:600; padding:2px 9px; border-radius:20px;">${m.category}</span></td>
            <td style="font-weight:700; color:var(--primary-dark);">₹${m.price}</td>
            <td style="color:var(--gray);">${m.stock ?? "—"}</td>
            <td>
              <button class="btn-edit" id="edit-btn-${m._id}" onclick="openEditModal('${m._id}')">Edit</button>
              <button class="btn-del" id="del-btn-${m._id}" onclick="deleteMedicineAdmin('${m._id}', \`${m.name}\`)">Delete</button>
            </td>
          </tr>
        `,
    )
    .join("");
}

// ---- Delete ----
async function deleteMedicineAdmin(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

  const delBtn = document.getElementById("del-btn-" + id);
  const editBtn = document.getElementById("edit-btn-" + id);
  if (delBtn) {
    delBtn.disabled = true;
    delBtn.textContent = "Deleting...";
  }
  if (editBtn) editBtn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/api/medicines/${id}`, {
      method: "DELETE",
    });
    const result = await res.json();

    if (result.success) {
      // Remove row from DOM immediately
      const row = document.getElementById("med-row-" + id);
      if (row) row.remove();
      // Update cache & count
      medicinesCache = medicinesCache.filter((m) => m._id !== id);
      document.getElementById("med-count").textContent =
        `${medicinesCache.length} medicine${medicinesCache.length !== 1 ? "s" : ""} found`;
      if (medicinesCache.length === 0) setMedState("med-empty");
      showToast(`"${name}" deleted.`);
    } else {
      showToast("❌ " + result.message);
      if (delBtn) {
        delBtn.disabled = false;
        delBtn.textContent = "Delete";
      }
      if (editBtn) editBtn.disabled = false;
    }
  } catch (err) {
    showToast("❌ Server error. Try again.");
    if (delBtn) {
      delBtn.disabled = false;
      delBtn.textContent = "Delete";
    }
    if (editBtn) editBtn.disabled = false;
  }
}

// ---- Edit Modal ----
let editingId = null;

function openEditModal(id) {
  const med = medicinesCache.find((m) => m._id === id);
  if (!med) {
    showToast("❌ Medicine not found in cache. Refresh.");
    return;
  }
  editingId = id;

  document.getElementById("edit-name").value = med.name || "";
  document.getElementById("edit-description").value = med.description || "";
  document.getElementById("edit-price").value = med.price || "";
  document.getElementById("edit-stock").value = med.stock ?? "";
  document.getElementById("edit-category").value = med.category || "";
  document.getElementById("edit-manufacturer").value = med.manufacturer || "";
  document.getElementById("edit-imageUrl").value = med.imageUrl || "";
  document.getElementById("edit-modal-title").textContent = `Edit: ${med.name}`;
  document.getElementById("edit-msg").style.display = "none";

  document.getElementById("edit-modal").classList.add("open");
}

function closeEditModal() {
  document.getElementById("edit-modal").classList.remove("open");
  editingId = null;
}

// Close modal on overlay click
document.getElementById("edit-modal").addEventListener("click", function (e) {
  if (e.target === this) closeEditModal();
});

async function saveEditMedicine() {
  if (!editingId) return;

  const payload = {
    name: document.getElementById("edit-name").value.trim(),
    description: document.getElementById("edit-description").value.trim(),
    price: parseFloat(document.getElementById("edit-price").value),
    stock: parseInt(document.getElementById("edit-stock").value) || 0,
    category: document.getElementById("edit-category").value.trim(),
    manufacturer: document.getElementById("edit-manufacturer").value.trim(),
    imageUrl: document.getElementById("edit-imageUrl").value.trim(),
  };

  if (
    !payload.name ||
    !payload.description ||
    !payload.price ||
    !payload.category
  ) {
    const msgEl = document.getElementById("edit-msg");
    msgEl.textContent =
      "❌ Name, Description, Price and Category are required.";
    msgEl.style.display = "block";
    return;
  }

  const saveBtn = document.getElementById("edit-save-btn");
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";

  try {
    const res = await fetch(`${API_BASE}/api/medicines/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json();

    if (result.success) {
      // Update cache
      const idx = medicinesCache.findIndex((m) => m._id === editingId);
      if (idx !== -1) medicinesCache[idx] = result.data;
      // Re-render table
      renderMedicinesTable(medicinesCache);
      closeEditModal();
      showToast(`✅ "${payload.name}" updated!`);
    } else {
      const msgEl = document.getElementById("edit-msg");
      msgEl.textContent = "❌ " + result.message;
      msgEl.style.display = "block";
    }
  } catch (err) {
    const msgEl = document.getElementById("edit-msg");
    msgEl.textContent = "❌ Server error. Try again.";
    msgEl.style.display = "block";
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Changes";
  }
}
