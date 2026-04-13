<div align="center">
  <h1 align="center">🛍️ Shiv Shakti Suits </h1>
  <p align="center">
    A fully-featured, full-stack e-commerce platform built specifically for showcasing and purchasing ethnic fashion and suits.
    <br />
    <br />
    <a href="#live-demo"><strong>View Demo »</strong>https://www.shivshaktisuits.shop</a>
    <br />
    <br />
    <a href="#features">Features</a> · <a href="#tech-stack">Tech Stack</a> · <a href="#api-endpoints">API</a>
  </p>

  <!-- Badges -->
  <p align="center">
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express framework" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E" alt="JavaScript" />
  </p>
</div>

---

## 📝 Description

**Shiv Shakti Suits** is a full-stack e-commerce application developed to handle the complete shopping lifecycle for fashion retail. Powered by Node.js, Express, and MongoDB, this platform seamlessly integrates server-side EJS rendering with a robust REST API backend. It features secure user authentication via sessions, dynamic complex product variants handling (size, stock, attributes), integrated Razorpay checkout for seamless payments, and a private admin dashboard to handle inventory and orders.

---

## 🚀 Live Demo

> 👉 **[Live Website Link](https://www.shivshaktisuits.shop/)** 

---

## ✨ Features

- **🛡️ Secure User Authentication**: Sign up/Log in functionality with encrypted passwords (`bcryptjs`) and secure session management.
- **🛒 Dynamic Shopping Cart & Wishlist**: Real-time cart updates processing individual product variants, sizes, and quantities.
- **💳 Integrated Checkout Flow**: Secure real-time payment gateway orchestration via **Razorpay**.
- **📍 Smart Address Management**: Save multiple user addresses (Home, Work, Other) and validate delivery pin codes.
- **👚 Deep Product Catalog**: Supports robust product categorization, filtering, variants (sizes/stock levels), and multiple product image modeling.
- **⭐ Reviews & Ratings**: Intelligent best-seller tracking and average user rating aggregation.
- **🔐 Admin Dashboard**: Protected routes for administrators to manage products, update stock logic, and track user orders.
- **✉️ Automated Emails**: Trigger transactional notifications (using tools like Brevo/Nodemailer).

---

## 💻 Tech Stack

| Infrastructure | Technology used |
| :---         | :--- |
| **Frontend** | HTML5, Vanilla CSS, JavaScript, EJS (Embedded JavaScript Templates) |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (coupled with Mongoose ODM), Connect-Mongo (Session Store) |
| **Payments** | Razorpay SDK |
| **Auth/Security** | `express-session`, `bcryptjs`, `jsonwebtoken` |
| **Mailing** | `nodemailer`, `@getbrevo/brevo`, `mailersend`, `resend` |

---

## 📸 Screenshots


### 🏠 Homepage
![Homepage](./public/screenshots/home.png)
> *The landing page showcasing featured categories, banners, and bestselling products.*

### 🛒 Product Listing
![Products](./public/screenshots/products.png)
> *Product details page highlighting size variants, stock status, fabric details, and reviews.*

### 🛍️ Shopping Cart
![Shopping Cart](./public/screenshots/cart.png)
> *Dynamic cart interface showing selected variants, quantities, and order summary.*

### 💳 Secure Checkout & Razorpay
![Checkout](./public/screenshots/checkout.png)
> *Seamless, fast, and secure payment via Razorpay integration.*

### 🔐 Admin Dashboard
![Admin Dashboard](./public/screenshots/admin.png)
> *Comprehensive admin panel for managing inventory, tracking orders, and evaluating metrics.*

### 👤 User Profile & Orders
![User Profile](./public/screenshots/profile.png)
> *Customer dashboard highlighting order history and saved delivery addresses.*

### 🦶 Footer & Navigation
![Footer](./public/screenshots/footer.png)
> *Site-wide footer featuring quick links, newsletter signup, and brand information.*

---

## 🛠️ Installation Guide

Follow these steps to set up the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18.x or above)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/AtulRao22/Shiv-Shakti-Suits.git
cd Shiv-Shakti-Suits
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Start the Development Server
From the `backend` directory, use the dev script to run the application using Nodemon:
```bash
npm run dev
```
*(Alternatively, for production, run `npm start`)*

The server will start on `http://localhost:8080`.

---

## 📁 Folder Structure

```text
📦 Shiv-Shakti-Suits
 ┣ 📂 backend/
 ┃ ┣ 📂 config/               # Database and third-party configuration files
 ┃ ┣ 📂 controllers/          # Business logic for routes
 ┃ ┣ 📂 middleware/           # Auth and validation middlewares
 ┃ ┣ 📂 models/               # Mongoose DB Schemas (User, Product, Order)
 ┃ ┣ 📂 routes/               # Express routing (home, api/products, checkout)
 ┃ ┣ 📂 views/                # EJS template files (index, checkout, admin)
 ┃ ┣ 📜 package.json          # Backend dependencies
 ┃ ┗ 📜 server.js             # Main server entrypoint
 ┣ 📂 public/                 # Static assets (Served by Express)
 ┃ ┣ 📂 assets/               # Global brand assets/images
 ┃ ┣ 📂 css/                  # Styling files
 ┃ ┣ 📂 js/                   # Client-side JavaScript functionality
 ┃ ┗ 📂 uploads/              # Local file upload directory
 ┣ 📜 .gitignore              # Ignored git files
 ┣ 📜 package.json            # Root project wrapper/runner
 ┗ 📜 README.md               # Project documentation
```

---

## 🌐 Selected API Endpoints

While the site is largely Server-Side Rendered (EJS), it relies on dedicated REST controllers:

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/products` | Fetch all products / Filter by categories | ❌ |
| `POST` | `/api/users/login` | Authenticate user & init session | ❌ |
| `POST` | `/cart/add` | Add variant to active user session cart | ✅ |
| `GET` | `/checkout` | Render the secure checkout gateway | ✅ |
| `POST` | `/api/orders` | Finalize & commit successful order to DB | ✅ |
| `GET` | `/admin` | Render the main storefront dashboard | ✅ (Admin) |

---

## 🔐 Environment Variables

Create a `.env` file inside the `/backend` folder. You will need the following keys to make everything function locally:

```env
# Server
PORT=8080
SESSION_SECRET=your_super_secret_session_key

# Database
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/xyz-fashion

# Razorpay (Payments)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Optional Services (Emails)
RESEND_API_KEY=your_resend_api_key
BREVO_API_KEY=your_brevo_api_key
```

---

## 📈 Challenges & Learnings

- **Complex Variant Handling:** Building a single schema capable of handling multi-dimensional variants (size + specific stock limits per size) proved challenging but significantly rewarding for cart validation logic.
- **Secure Transaction Workflows:** Integrating Razorpay required deep dives into webhooks, transaction signing, and safely reverting stock if a payment abruptly failed.
- **Session Persistence:** Successfully moving away from in-memory sessions to a persistent MongoDB storage structure (`connect-mongo`) preventing user logouts during continuous deploy cycles.

---

## 🚀 Future Improvements

- [ ] Transition views from server-rendered EJS to a decoupled React/Next.js frontend.
- [ ] Incorporate Elasticsearch for ultra-fast, typo-tolerant product searches.
- [ ] Add bulk CSV upload utility to the admin portal for managing inventory.
- [ ] Integrate automated PDF invoice generation via email on successful purchases.

---

## 🤝 Contributing Guidelines

Contributions, issues, and feature requests are welcome!
Feel free to check out the [issues page](https://github.com/AtulRao22/Shiv-Shakti-Suits/issues).

1. Fork the project.
2. Create your Feature Branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the Branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request.

---

## 📜 License

Distributed under the ISC License. See `LICENSE` for more information.

---

## 🙋‍♂️ Author

**Atul Rao**  
*MERN Stack Developer*  
📍 Location: Jaipur,Rajasthan,India 

- **GitHub:** [@AtulRao22](https://github.com/AtulRao22) 
- **LinkedIn:** [atul-rao-44b2212b8](https://www.linkedin.com/in/atul-rao-44b2212b8/) 
- **Portfolio / Email:** 02atulrao@gmail.com

---
<p align="center">Made with ❤️ by Atul Rao</p>
