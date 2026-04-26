// =====================================================
    // index.js (inline) - Home Page Script
    // Renders feature cards dynamically using DOM manipulation
    // =====================================================

    // Array of feature objects
    const reviews = [
  { name: "Amit", city: "Kolkata", text: "Fast delivery and genuine medicines. Really helpful!", rating: 5 },
  { name: "Rajdeep", city: "Delhi", text: "Easy ordering and affordable prices. Loved it!", rating: 4 },
  { name: "Alina", city: "Bangalore", text: "Very convenient for daily medicines. Saved time.", rating: 5 },
  { name: "Rajesh", city: "Mumbai", text: "Smooth experience and quick delivery.", rating: 4 }
];

const reviewsGrid = document.getElementById("reviews-grid");

reviews.forEach((review) => {
  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);

  const card = document.createElement("div");
  card.classList.add("review-card");

  card.innerHTML = `
    <div class="review-header">
      <div class="review-avatar">${review.name.charAt(0)}</div>
      <div>
        <div class="review-name">${review.name}</div>
        <div class="review-city">${review.city}</div>
      </div>
    </div>

    <div class="review-stars">${stars}</div>
    <div class="review-text">"${review.text}"</div>
  `;

  reviewsGrid.appendChild(card);
});
    const features = [
      {
        icon: "fa-truck",
        title: "Fast Delivery",
        description: "Get medicines delivered to your door.",
      },
      {
        icon: "fa-tags",
        title: "Best Prices",
        description: "Competitive prices and exclusive discounts every day.",
      },
      {
        icon: "fa-shield-halved",
        title: "Secure Ordering",
        description: "Your health data is safe and private with us.",
      },
    ];

    // Get the container element where feature cards will be inserted
    const featuresGrid = document.getElementById("features-grid");

    // Loop through each feature and create a card
    features.forEach((feature) => {
      // Create a div element for the card
      const card = document.createElement("div");
      card.classList.add("card");

      // Set the HTML content of the card
      card.innerHTML = `
        <div style="font-size: 2.5rem; text-align: center; margin-bottom: 12px;">
          <i class="fa-solid ${feature.icon}"></i>
        </div>
        <h3 style="text-align: center; margin-bottom: 8px;">${feature.title}</h3>
        <p style="font-size: 0.87rem; color: #64748b; text-align: center;">${feature.description}</p>
      `;

      // Append the card to the grid container
      featuresGrid.appendChild(card);
    });
    const slides = document.querySelector(".slides");
    const slide = document.querySelectorAll(".slide");

    let index = 0;

    function showSlide(i) {
      index = (i + slide.length) % slide.length;
      slides.style.transform = `translateX(-${index * 100}%)`;
    }

    document.querySelector(".next").onclick = () => {
      showSlide(index + 1);
    };

    document.querySelector(".prev").onclick = () => {
      showSlide(index - 1);
    };

    // Auto slide every 3 seconds
    setInterval(() => {
      showSlide(index + 1);
    }, 3000);

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