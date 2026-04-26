# 💊 Online Medicine Store

A beginner-friendly full-stack web application built with **HTML, CSS, JavaScript, Node.js, Express, and MongoDB** for learning and academic purposes.

---

## 📁 Project Structure

```
online-medicine-store/
│
├── backend/                          # Node.js + Express Backend
│   ├── config/
│   │   └── db.js                     # MongoDB connection
│   ├── controllers/
│   │   ├── userController.js         # User logic
│   │   ├── medicineController.js     # Medicine logic
│   │   └── orderController.js        # Order logic
│   ├── models/
│   │   ├── User.js                   # User schema (Mongoose)
│   │   ├── Medicine.js               # Medicine schema
│   │   └── Order.js                  # Order schema
│   ├── routes/
│   │   ├── userRoutes.js             # /api/users routes
│   │   ├── medicineRoutes.js         # /api/medicines routes
│   │   └── orderRoutes.js            # /api/orders routes
│   ├── .env                          # Environment variables
│   ├── package.json                  # Dependencies
│   └── server.js                     # Main server entry point
│
└── frontend/                         # HTML/CSS/JS Frontend
    ├── css/
    │   └── style.css                 # Global stylesheet
    └── pages/
        ├── index.html                # Home page
        ├── login.html                # Login page
        ├── register.html             # Register page
        ├── medicines.html            # Medicines listing page
        └── cart.html                 # Shopping cart page
```

---

## 🚀 How to Run the Project

### Step 1: Setup the Backend

```bash
# Navigate to the backend folder
cd backend

# Install all required packages
npm install

# Start the server (development mode with auto-restart)
npm run dev
```

The server will start at: `http://localhost:5000`

### Step 2: Open the Frontend

Simply open any `.html` file from the `frontend/pages/` folder in your browser.

> 💡 **Tip:** The `medicines.html` page has built-in dummy data and works even without the backend!

---

## 🔗 API Endpoints

| Method | Endpoint                   | Description          |
|--------|----------------------------|----------------------|
| GET    | /api/users                 | Get all users        |
| POST   | /api/users/register        | Register a new user  |
| POST   | /api/users/login           | Login a user         |
| GET    | /api/medicines             | Get all medicines    |
| GET    | /api/medicines/:id         | Get medicine by ID   |
| POST   | /api/medicines             | Add a new medicine   |
| DELETE | /api/medicines/:id         | Delete a medicine    |
| GET    | /api/orders                | Get all orders       |
| POST   | /api/orders                | Place a new order    |
| GET    | /api/orders/:id            | Get order by ID      |

---

## 🛠️ Technologies Used

| Layer    | Technology         |
|----------|--------------------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Backend  | Node.js, Express.js |
| Database | MongoDB, Mongoose  |

---

## 📋 Prerequisites

- **Node.js** installed (v14 or higher) → [Download](https://nodejs.org)
- **MongoDB** installed and running locally → [Download](https://www.mongodb.com/try/download/community)

---

## 📚 Key Concepts Covered

- MVC Architecture (Models, Views/Templates, Controllers)
- RESTful API design
- Mongoose schemas and models
- Express routing and middleware
- DOM manipulation with vanilla JavaScript
- Fetch API for HTTP requests
- localStorage for client-side state (cart)
- CSS Flexbox for responsive layout

---

*Made for learning purposes — clarity over complexity 🎓*
