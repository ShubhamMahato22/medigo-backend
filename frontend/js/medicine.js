 /*
         medicine
         1. Parse ?id= from URL
         2. Fetch medicine from API
         3. Render full detail layout
         4. Add to Cart (reuses localStorage logic)
*/

      const API_BASE = "https://medigo-backend-bljr.onrender.com";

      // ---- DOM references ----
      const loadingState   = document.getElementById("loading-state");
      const errorState     = document.getElementById("error-state");
      const errorMsgEl     = document.getElementById("error-msg");
      const detailEl       = document.getElementById("medicine-detail");
      const breadcrumbName = document.getElementById("breadcrumb-name");
      const toast          = document.getElementById("toast");
      const toastMsg       = document.getElementById("toast-msg");
      const toastIcon      = document.getElementById("toast-icon");

      // Quantity state
      let quantity = 1;

      // ---- Show / hide helpers ----
      function showLoading() {
        loadingState.style.display = "flex";
        errorState.style.display   = "none";
        detailEl.style.display     = "none";
      }

      function showError(msg) {
        loadingState.style.display = "none";
        errorState.style.display   = "flex";
        detailEl.style.display     = "none";
        errorMsgEl.textContent     = msg || "Failed to load medicine details.";
      }

      function showDetail() {
        loadingState.style.display = "none";
        errorState.style.display   = "none";
        detailEl.style.display     = "block";
      }

      // ---- Toast notification ----
      let toastTimer;
      function showToast(message, isSuccess = true) {
        toastIcon.textContent = isSuccess ? "✅" : "❌";
        toastMsg.textContent  = message;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("show"), 2800);
      }

      // ---- Quantity controls (exposed globally for inline onclick) ----
      function changeQty(delta) {
        quantity = Math.max(1, quantity + delta);
        document.getElementById("qty-display").textContent = quantity;
      }


      // CUSTOMER REVIEWS LOGIC
    
      let currentMedicineId = null;

      function toggleReviewForm() {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
          showErrorToast("Please login to write a review");
          return;
        }

        const form = document.getElementById('review-form-container');
        if (form.style.display === 'none') {
          form.style.display = 'block';
          const nameInput = document.getElementById('review-name');
          if (nameInput) {
            nameInput.value = user.name || "Anonymous User";
            nameInput.readOnly = true;
          }
        } else {
          form.style.display = 'none';
        }
      }

      function showErrorToast(message) {
        showToast(message, false);
      }

      async function submitReview(event) {
        event.preventDefault();
        
        if (!currentMedicineId) return;

        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
          showErrorToast("Please login to write a review");
          return;
        }

        const name = document.getElementById('review-name').value.trim();
        const rating = parseInt(document.getElementById('review-rating').value, 10);
        const comment = document.getElementById('review-text').value.trim();

        if (!name || !comment || rating < 1 || rating > 5) {
          alert('Please provide valid review details.');
          return;
        }

        const submitBtn = document.querySelector('#review-form button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = "Submitting...";

        try {
          const res = await fetch(`${API_BASE}/api/reviews/${currentMedicineId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: user._id || user.id, name, comment, rating })
          });
          
          const result = await res.json();
          if (result.success) {
            document.getElementById('review-form').reset();
            toggleReviewForm();
            showToast("Review added successfully!");
            loadMedicine(); // Reload to update avgRating and reviews list
          } else {
            showErrorToast(result.message || "Failed to submit review");
          }
        } catch (err) {
          showErrorToast("Server Error. Please try again later.");
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit Review";
        }
      }

      async function renderReviews() {
        if (!currentMedicineId) return;

        const reviewsList = document.getElementById('reviews-list');
        if (!reviewsList) return;

        try {
          const res = await fetch(`${API_BASE}/api/reviews/${currentMedicineId}`);
          const result = await res.json();
          
          if (!result.success || !result.data || result.data.length === 0) {
            reviewsList.innerHTML = `<p style="text-align: center; color: var(--gray); padding: 24px 0;">No reviews yet. Be the first to review!</p>`;
            return;
          }

          const reviews = result.data;
          const user = JSON.parse(localStorage.getItem("user"));
          
          if (user) {
            const hasReviewed = reviews.some(r => r.user === user._id || r.user === user.id);
            const writeReviewBtn = document.getElementById('write-review-btn');
            if (writeReviewBtn) {
              writeReviewBtn.style.display = hasReviewed ? 'none' : 'inline-block';
            }
          }
          reviewsList.innerHTML = reviews.map(r => {
            const stars = '⭐'.repeat(r.rating);
            const dateStr = new Date(r.createdAt).toLocaleDateString();
            return `
              <div class="review-card">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px;">
                  <span style="font-weight: 700; color: var(--dark);">${r.name}</span>
                  <span style="font-size: 0.85rem; color: var(--gray);">${dateStr}</span>
                </div>
                <div class="review-stars" style="margin-bottom: 8px;">${stars}</div>
                <p style="color: var(--gray); font-size: 0.95rem; line-height: 1.5; margin: 0;">${r.comment}</p>
              </div>
            `;
          }).join('');
        } catch (err) {
          reviewsList.innerHTML = `<p style="text-align: center; color: var(--danger); padding: 24px 0;">Failed to load reviews.</p>`;
        }
      }

      // ---- Add to Cart (mirrors medicines.html logic) ----
      function addToCart(id, name, price, imageUrl) {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        const existing = cart.find((item) => item.id === id);

        if (existing) {
          existing.quantity += quantity;
        } else {
          cart.push({ id, name, price, imageUrl, quantity });
        }

        localStorage.setItem("cart", JSON.stringify(cart));
        showToast(`"${name}" added to cart!`);

        // Animate button briefly
        const btn = document.getElementById("add-to-cart-btn");
        if (btn) {
          btn.textContent = "Added!";
          btn.disabled = true;
          setTimeout(() => {
            btn.innerHTML = "Add to Cart";
            btn.disabled = false;
          }, 1500);
        }
      }

      let descriptionExpanded = false;

      function toggleDescription() {
        descriptionExpanded = !descriptionExpanded;
        const descEl = document.getElementById('medicine-detail-desc');
        const btnEl = document.getElementById('read-more-btn');
        if (descEl && btnEl) {
          if (descriptionExpanded) {
            descEl.classList.add('expanded');
            btnEl.innerHTML = "Show Less ▲";
          } else {
            descEl.classList.remove('expanded');
            btnEl.innerHTML = "Read More ▼";
          }
        }
      }

      function formatDescription(text) {
        if (!text) return "No description available.";
        return text
          .replace(/\n/g, "<br>")
          .replace(/(Benefits|Uses|Side Effects|Precautions|Dosage)/gi, "<h4>$1</h4>");
      }

      function getImageUrl(path) {
        if (!path) return "../assets/images/default-medicine.png";
        if (path.startsWith("http")) {
          return path;
        }
        return `../${path}`;
      }

      // ---- Render medicine detail ----
      function renderMedicine(medicine) {
        const imgSrc = getImageUrl(medicine.imageUrl);

        // Update page title & breadcrumb
        document.title = `${medicine.name} | MediStore`;
        breadcrumbName.textContent = medicine.name;

        detailEl.innerHTML = `
          <div class="detail-card">

            <!-- LEFT: Image -->
            <div class="detail-image-panel">
              <div class="detail-image-wrap">
                <img
                  id="medicine-img"
                  src="${imgSrc}"
                  alt="${medicine.name}"
                  onerror="this.src='../assets/images/default-medicine.png'"
                />
              </div>
              <span class="stock-badge in-stock">
                ✔ In Stock
              </span>
            </div>

            <!-- RIGHT: Info -->
            <div class="detail-info-panel">

              <!-- Category -->
              <span class="detail-category"> ${medicine.category}</span>

              <!-- Name -->
              <h1 class="detail-name">${medicine.name}</h1>
              <div style="font-size: 0.9rem; color: #64748b; margin-top: 8px; margin-bottom: 12px; display: flex; align-items: center; gap: 4px;">
                ${medicine.totalReviews > 0 ? `
                  <span style="color: #eab308; font-size: 1rem; letter-spacing: -2px;">⭐⭐⭐⭐⭐</span>
                  <span style="font-weight: 600; color: #475569; margin-left: 2px;">${medicine.avgRating || 0}</span>
                  <span>(${medicine.totalReviews} reviews)</span>
                ` : `
                  <span style="color: #94a3b8;">No ratings yet</span>
                `}
              </div>

              <hr class="detail-divider" />

              <!-- Price -->
              <div class="detail-price-block">
                <span class="detail-price">₹${medicine.price}</span>
                <span class="detail-price-label">per unit · incl. of all taxes</span>
              </div>

              <!-- Description -->
              <div>
                <p class="detail-desc-label">About this medicine</p>
                <div class="detail-desc" id="medicine-detail-desc">
                  ${formatDescription(medicine.description)}
                </div>
                ${medicine.description && medicine.description.length > 300 ? `
                  <div class="read-more-btn" id="read-more-btn" onclick="toggleDescription()">Read More ▼</div>
                ` : ''}
              </div>

              <!-- Quantity Selector -->
              <div class="qty-row">
                <span class="qty-label">Qty:</span>
                <div class="qty-control">
                  <button class="qty-btn" id="qty-dec" onclick="changeQty(-1)" aria-label="Decrease quantity">−</button>
                  <span class="qty-display" id="qty-display">1</span>
                  <button class="qty-btn" id="qty-inc" onclick="changeQty(1)" aria-label="Increase quantity">+</button>
                </div>
              </div>

              <!-- CTA Buttons -->
              <div class="detail-actions">
                <button
                  id="add-to-cart-btn"
                  class="btn btn-primary btn-add-cart"
                  onclick="addToCart('${medicine._id}', '${medicine.name}', ${medicine.price}, '${medicine.imageUrl || ""}')"
                >
                   Add to Cart
                </button>
                <a href="medicines.html" class="btn btn-outline btn-back">
                  ← Back
                </a>
              </div>

            </div>
          </div>

          <!-- ===================== CUSTOMER REVIEWS ===================== -->
          <div class="reviews-section" style="margin-top: 32px; background: #fff; border-radius: 14px; box-shadow: var(--shadow); padding: 32px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px;">
              <h2 style="font-size: 1.3rem; color: var(--dark); font-weight: 700;">Customer Reviews</h2>
              <button id="write-review-btn" class="btn btn-outline" onclick="toggleReviewForm()">Write a Review</button>
            </div>

            <!-- Review Form (Hidden by default) -->
            <div id="review-form-container" style="display: none; background: var(--bg); padding: 20px; border-radius: 10px; margin-bottom: 24px; border: 1px solid var(--border);">
              <h3 style="font-size: 1.1rem; margin-bottom: 16px; color: var(--dark);">Write your review</h3>
              <form id="review-form" onsubmit="submitReview(event)">
                <div style="margin-bottom: 12px;">
                  <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px; color: var(--gray);">Your Name *</label>
                  <input type="text" id="review-name" required style="width: 100%; padding: 10px; border: 1.5px solid var(--border); border-radius: 8px; font-family: var(--font);" placeholder="e.g. John Doe">
                </div>
                <div style="margin-bottom: 12px;">
                  <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px; color: var(--gray);">Rating (1-5) *</label>
                  <input type="number" id="review-rating" required min="1" max="5" style="width: 100%; padding: 10px; border: 1.5px solid var(--border); border-radius: 8px; font-family: var(--font);" placeholder="5">
                </div>
                <div style="margin-bottom: 16px;">
                  <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 6px; color: var(--gray);">Review *</label>
                  <textarea id="review-text" required rows="3" style="width: 100%; padding: 10px; border: 1.5px solid var(--border); border-radius: 8px; font-family: var(--font); resize: vertical;" placeholder="Great product..."></textarea>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                  <button type="button" class="btn btn-outline" onclick="toggleReviewForm()">Cancel</button>
                  <button type="submit" class="btn btn-primary">Submit Review</button>
                </div>
              </form>
            </div>

            <!-- List of Reviews -->
            <div id="reviews-list"></div>
          </div>
        `;

        showDetail();
        renderReviews();
      }

      // ---- Main: fetch medicine by ID ----
      async function loadMedicine() {
        showLoading();

        // 1. Extract ID from URL query param
        const params = new URLSearchParams(window.location.search);
        const id     = params.get("id");

        if (!id) {
          showError("No medicine ID provided. Please go back and select a medicine.");
          return;
        }

        // 2. Call API
        try {
          const response = await fetch(`${API_BASE}/api/medicines/${id}`);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const result = await response.json();

          if (result.success && result.data) {
            currentMedicineId = id;
            renderMedicine(result.data);
          } else {
            throw new Error(result.message || "Medicine not found.");
          }
        } catch (err) {
          console.error("Failed to load medicine:", err);
          showError("Could not load medicine details. Make sure the server is running.");
        }
      }

      // ---- Run on page load ----
      loadMedicine();

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