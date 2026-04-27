 const medicinesGrid = document.getElementById("medicines-grid");
      const loadingMsg    = document.getElementById("loading-msg");
      const errorMsg      = document.getElementById("error-msg");
      const searchInput   = document.getElementById("search-input");

      /*SEARCH & FILTER STATE */

      /** Master list — populated once after first successful API fetch */
      let allMedicines = [];
      let selectedCategory = "All";

      /** Simple debounce to avoid re-rendering on every keystroke */
      function debounce(fn, delay) {
        let timer;
        return function (...args) {
          clearTimeout(timer);
          timer = setTimeout(() => fn.apply(this, args), delay);
        };
      }

      /** Filter allMedicines by name and category, then re-render */
      function filterMedicines() {
        const query = searchInput.value.trim().toLowerCase();
        
        let filtered = allMedicines;
        
        if (selectedCategory !== "All") {
          filtered = filtered.filter((m) => m.category === selectedCategory);
        }
        
        if (query !== "") {
          filtered = filtered.filter((m) => m.name.toLowerCase().includes(query));
        }
        
        renderMedicines(filtered);
      }

      /** Category selection logic */
      function selectCategory(category) {
        selectedCategory = category;
        const buttons = document.querySelectorAll('.category-btn');
        buttons.forEach(btn => {
          if (btn.dataset.category === category) {
            btn.classList.add('active');
            btn.style.background = '#16a34a';
            btn.style.color = '#fff';
            btn.style.borderColor = '#16a34a';
          } else {
            btn.classList.remove('active');
            btn.style.background = '#f8fafc';
            btn.style.color = '#475569';
            btn.style.borderColor = '#cbd5e1';
          }
        });
        filterMedicines();
      }

      /** Render category filter buttons dynamically */
      function renderCategoryFilters(medicines) {
        const filtersContainer = document.getElementById('category-filters');
        if (!filtersContainer) return;
        
        const categories = [...new Set(medicines.map(m => m.category))].filter(Boolean).sort();
        
        let html = `<button class="category-btn active" data-category="All" onclick="selectCategory(this.dataset.category)" style="padding: 6px 16px; border-radius: 20px; border: 1px solid #16a34a; background: #16a34a; color: #fff; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; font-family: inherit;">All</button>`;
        
        categories.forEach(cat => {
          // Capitalize properly
          const displayCat = cat.charAt(0).toUpperCase() + cat.slice(1);
          // Escape quotes in data-category
          const safeCat = cat.replace(/"/g, '&quot;');
          html += `<button class="category-btn" data-category="${safeCat}" onclick="selectCategory(this.dataset.category)" style="padding: 6px 16px; border-radius: 20px; border: 1px solid #cbd5e1; background: #f8fafc; color: #475569; font-size: 0.85rem; cursor: pointer; transition: all 0.2s; font-family: inherit;" onmouseover="if(!this.classList.contains('active')){this.style.background='#e2e8f0'}" onmouseout="if(!this.classList.contains('active')){this.style.background='#f8fafc'}">${displayCat}</button>`;
        });
        
        filtersContainer.innerHTML = html;
      }

      // Wire up the debounced listener (250 ms)
      searchInput.addEventListener("input", debounce(filterMedicines, 250));


      /* ============================================================
         REUSABLE CART HELPERS  (localStorage as single source of truth)
         ============================================================ */

      /** Return the current cart array from localStorage */
      function getCart() {
        return JSON.parse(localStorage.getItem("cart")) || [];
      }

      /** Persist a cart array to localStorage */
      function saveCart(cart) {
        localStorage.setItem("cart", JSON.stringify(cart));
      }

      /**
       * Add an item to the cart (or increment its qty).
       * After saving, update the UI for that medicine card.
       */
      function addToCart(id) {
  const med = allMedicines.find(m => m._id === id);
  if (!med) return;

  const cart = getCart();
  const existing = cart.find((i) => i.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      id: med._id,
      name: med.name,
      price: med.price,
      imageUrl: med.imageUrl,
      quantity: 1
    });
  }

  saveCart(cart);
  refreshCardUI(id);
}

      /** Increase qty of an existing cart item and refresh the card */
      function increaseQty(id) {
        const cart = getCart();
        const item = cart.find((i) => i.id === id);
        if (item) {
          item.quantity += 1;
          saveCart(cart);
          refreshCardUI(id);
        }
      }

      /**
       * Decrease qty; if it reaches 0 remove the item and show
       * the "Add to Cart" button again.
       */
      function decreaseQty(id) {
        let cart = getCart();
        const item = cart.find((i) => i.id === id);
        if (!item) return;

        item.quantity -= 1;

        if (item.quantity <= 0) {
          cart = cart.filter((i) => i.id !== id);
        }

        saveCart(cart);
        refreshCardUI(id);
      }

      /*CARD UI HELPERS*/

      /**
       * Find the action area of a card (identified by data-medicine-id)
       * and swap between the "Add to Cart" button and the qty pill.
       */
      function refreshCardUI(id) {
        const actionEl = document.querySelector(
          `[data-medicine-id="${id}"]`
        );
        if (!actionEl) return;

        const cart = getCart();
        const item = cart.find((i) => i.id === id);

        if (item && item.quantity > 0) {
          // Show pill
          actionEl.innerHTML = `
            <div class="qty-pill">
              <button
                class="qty-pill-btn"
                id="dec-${id}"
                onclick="decreaseQty('${id}')"
                aria-label="Decrease quantity"
              >−</button>
              <span class="qty-pill-count">${item.quantity}</span>
              <button
                class="qty-pill-btn"
                id="inc-${id}"
                onclick="increaseQty('${id}')"
                aria-label="Increase quantity"
              >+</button>
            </div>`;
        } else {
          // Show plain button — restore original name/price from data attrs
          const name  = actionEl.dataset.name;
          const price = actionEl.dataset.price;
          actionEl.innerHTML = `
            <button
              class="btn btn-primary"
              style="width:100%;"
              onclick="addToCart('${id}')"
            >Add to Cart</button>`;
        }
      }

      /* ============================================================
         RENDER
         ============================================================ */

      function truncateText(text, limit = 90) {
        if (!text) return "";
        return text.length > limit ? text.substring(0, limit) + "..." : text;
      }

      function getImageUrl(path) {
        if (!path) return "../assets/images/default-medicine.png";
        if (path.startsWith("http")) {
          return path;
        }
        return `../${path}`;
      }

      function renderMedicines(medicines) {
        medicinesGrid.innerHTML = "";

        if (medicines.length === 0) {
          medicinesGrid.innerHTML =
            "<p style='color:#64748b;'>No medicines found.</p>";
          return;
        }

        medicines.forEach((medicine) => {
          let ratingHtml = "";
          if (medicine.totalReviews > 0) {
             ratingHtml = `
              <div style="font-size: 0.8rem; color: #64748b; margin-top: 4px; margin-bottom: 8px; display: flex; align-items: center; gap: 4px;">
                <span style="color: #eab308; font-size: 0.9rem; letter-spacing: -2px;">⭐⭐⭐⭐⭐</span>
                <span style="font-weight: 600; color: #475569; margin-left: 2px;">${medicine.avgRating || 0}</span>
                <span>(${medicine.totalReviews})</span>
              </div>
             `;
          } else {
             ratingHtml = `
              <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 4px; margin-bottom: 8px;">
                No ratings yet
              </div>
             `;
          }

          const card = document.createElement("div");
          card.classList.add("card");
          card.style.cursor = "pointer";

          card.innerHTML = `
            <a href="medicine.html?id=${medicine._id}" style="text-decoration:none; color:inherit;">
              <div class="card-img">
                <img
                  src="${getImageUrl(medicine.imageUrl)}"
                  alt="${medicine.name}"
                  onerror="this.src='../assets/images/default-medicine.png'"
                />
              </div>
              <span class="category">${medicine.category}</span>
              <h3>${medicine.name}</h3>
              ${ratingHtml}
            </a>

            <p class="card-desc">
              ${truncateText(medicine.description)}
            </p>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <p class="price" style="margin: 0;">₹${medicine.price}</p>
              <a href="medicine.html?id=${medicine._id}" style="font-size: 0.8rem; color: #16a34a; font-weight: 600; text-decoration: none;">View Details →</a>
            </div>

            <!-- action area — identified by data-medicine-id -->
            <div
              data-medicine-id="${medicine._id}"
              data-name="${medicine.name.replace(/"/g, '&quot;')}"
              data-price="${medicine.price}"
            ></div>
          `;

          medicinesGrid.appendChild(card);

          // Set correct initial state based on localStorage
          refreshCardUI(medicine._id);
        });
      }

      /*FETCH*/

      async function fetchMedicines() {
        try {
          const response = await fetch("https://medigo-backend-bljr.onrender.com/api/medicines");
          const result   = await response.json();
          loadingMsg.style.display = "none";

          if (result.success) {
            allMedicines = result.data;   // cache full list for search
            renderCategoryFilters(allMedicines);
            renderMedicines(allMedicines);
          } else {
            throw new Error("API error");
          }
        } catch (error) {
          loadingMsg.style.display = "none";
          errorMsg.style.display = "block";
          errorMsg.innerText = "Failed to load medicines.";
        }
      }

      fetchMedicines();

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