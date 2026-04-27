const cartTbody     = document.getElementById("cart-tbody");
    const totalAmountEl = document.getElementById("total-amount");
    const emptyCart     = document.getElementById("empty-cart");
    const cartContent   = document.getElementById("cart-content");
    const cartMessage   = document.getElementById("cart-message");

    // Helper to show messages
    function showMessage(type, text) {
      cartMessage.className = "message " + type;
      cartMessage.textContent = text;
      cartMessage.style.display = "block";
      setTimeout(() => { cartMessage.style.display = "none"; }, 3000);
    }

    /* 
       REUSABLE CART HELPERS  (mirrors medicines.html helpers) */

    function getCart() {
      return JSON.parse(localStorage.getItem("cart")) || [];
    }

    function saveCart(cart) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }

    function increaseQty(id) {
      const cart = getCart();
      const item = cart.find((i) => i.id === id);
      if (item) {
        item.quantity += 1;
        saveCart(cart);
        loadCart();
      }
    }

    function decreaseQty(id) {
      let cart = getCart();
      const item = cart.find((i) => i.id === id);
      if (!item) return;

      item.quantity -= 1;

      if (item.quantity <= 0) {
        cart = cart.filter((i) => i.id !== id);
      }

      saveCart(cart);
      loadCart();
    }

    /*LOAD & RENDER CART*/

    function loadCart() {
      const cart = getCart();
      cartTbody.innerHTML = "";

      if (cart.length === 0) {
        emptyCart.style.display  = "block";
        cartContent.style.display = "none";
        return;
      }

      emptyCart.style.display  = "none";
      cartContent.style.display = "block";

      let total = 0;

      cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        total += subtotal;

        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${index + 1}</td>
          <td>${item.name}</td>
          <td>₹${item.price}</td>
          <td>
            <div class="cart-qty-ctrl">
              <button
                class="qty-pill-btn"
                onclick="decreaseQty('${item.id}')"
                aria-label="Decrease quantity"
              >−</button>
              <span class="qty-pill-count">${item.quantity}</span>
              <button
                class="qty-pill-btn"
                onclick="increaseQty('${item.id}')"
                aria-label="Increase quantity"
              >+</button>
            </div>
          </td>
          <td>₹${subtotal}</td>
          <td>
            <button
              class="btn btn-danger"
              style="padding: 6px 12px; font-size: 0.8rem;"
              onclick="removeItem('${item.id}')"
            >
              Remove
            </button>
          </td>
        `;

        cartTbody.appendChild(row);
      });

      totalAmountEl.textContent = "₹" + total;
    }

    /*EXISTING FUNCTIONS — UNCHANGED*/

    function removeItem(id) {
      let cart = getCart();
      cart = cart.filter((item) => item.id !== id);
      saveCart(cart);
      loadCart();
    }

    function clearCart() {
      if (confirm("Are you sure you want to clear the cart?")) {
        localStorage.removeItem("cart");
        loadCart();
      }
    }

    function placeOrder() {
      const cart = getCart();

      if (cart.length === 0) {
        showMessage("error", "Cart is empty. Add medicines first.");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        showMessage("error", "Please login before placing an order.");
        return;
      }

      const validItems = cart.filter(item => item.id && item.id.length === 24);

      if (validItems.length === 0) {
        showMessage("error", "Invalid cart data. Please re-add medicines.");
        return;
      }

      const totalAmount = validItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const orderPayload = {
        user: user._id,
        items: validItems.map((item) => ({
          medicine: item.id,
          quantity: item.quantity,
        })),
        totalAmount: totalAmount,
        deliveryAddress: user.address || "Default Address",
      };

      fetch("https://medigo-backend-bljr.onrender.com/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            showMessage("success", "Order placed successfully!");
            localStorage.removeItem("cart");
            setTimeout(() => loadCart(), 1000);
          } else {
            showMessage("error", "❌ " + data.message);
          }
        })
        .catch(() => {
          showMessage("error", "❌ Server error. Try again.");
        });
    }

    function goToCheckout() {
      const cart = getCart();

      if (cart.length === 0) {
        showMessage("error", "Cart is empty.");
        return;
      }

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        showMessage("error", "Please login first.");
        return;
      }

      window.location.href = "checkout.html";
    }

    // ---- Initialize ----
    loadCart();

    // ---- Auth: show user icon or Login/Register ----
    (function () {
      const authSection = document.getElementById("auth-section");
      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        authSection.innerHTML = `<a href="dashboard.html" title="My Account" style="font-size:1.4rem; line-height:1;">👤</a>`;
      } else {
        authSection.innerHTML = `
          <a href="login.html">Login</a>
          <a href="register.html" class="btn btn-primary" style="margin-left:8px;">Register</a>`;
      }
    })();