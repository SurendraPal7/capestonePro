# 🚜 Farmer-to-Buyer Marketplace

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Build%20Tool-Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Docker](https://img.shields.io/badge/Deployment-Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

A robust, full-stack marketplace connecting local farmers directly with bulk buyers, streamlining the agricultural supply chain and ensuring fair value for producers.

---

## 🚀 Problem Statement

In the traditional agricultural supply chain, farmers often face significant systemic challenges:
- **Low Profit Margins:** Multiple layers of intermediaries (brokers, distributors, and wholesalers) take a significant share of the final price, leaving farmers with minimal profits.
- **Lack of Price Transparency:** Without direct contact with buyers, farmers are often forced to sell at prices dictated by middlemen.
- **Product Freshness & Wastage:** Extended supply chains and multiple handling stages lead to increased wastage and reduced quality of perishable goods by the time they reach the buyer.
- **Market Access Barriers:** Small-scale farmers often find it impossible to reach large-scale buyers such as restaurants, hotels, or grocery chains without expensive brokerage.

**Farmer-to-Buyer Marketplace** provides a digital bridge that eliminates these intermediaries. By enabling direct communication and transaction between the producer and the purchaser, we ensure farmers get higher returns while buyers receive fresher products at competitive prices.

---

## 🛠️ Tech Stack

### Frontend (Client-Side)
- **React.js (Vite):** Utilized for building a high-performance, component-based user interface.
- **React Router DOM:** Handles seamless client-side navigation and role-based routing.
- **Recharts:** Integrated dynamic data visualization for real-time sales and revenue analytics.
- **Axios:** Managed efficient, asynchronous API communication with the backend.
- **React Icons:** Provided a modern and intuitive visual language for the UI.
- **Context API:** Centralized state management for Authentication and Shopping Cart.

### Backend (Server-Side)
- **Node.js & Express.js:** Powered a scalable RESTful API architecture designed for high throughput.
- **JWT (JSON Web Tokens):** Implemented secure, stateless session management.
- **Bcrypt.js:** Utilized for industry-standard password hashing and data security.
- **Multer:** Optimized handling of multi-part form data for product image uploads.

### Database & Storage
- **MongoDB:** Leveraged a NoSQL database for flexible and scalable agricultural data modeling.
- **Mongoose:** Employs a schema-based solution to model application data and handle relationships.

---

## ✨ Key Features

### 👨‍🌾 For Farmers (Sellers)
- **Direct Listing:** Upload and manage agricultural produce with images, specific units, and real-time pricing.
- **Advanced Sales Analytics:** Monitor performance through interactive Area Charts, filtering data from 1 month up to 5 years of history.
- **Earnings Tracking:** A dedicated dashboard to view total revenue, order volume, and business growth trends.
- **Order Management:** Streamlined interface to track incoming orders and fulfill buyer requests.

### 🛒 For Buyers
- **Live Marketplace:** A visually rich interface to browse fresh produce from verified local farmers.
- **Dynamic Shopping Cart:** Seamlessly add products, adjust quantities, and manage potential orders.
- **Transparent Checkout:** Direct ordering system with clear pricing and order confirmation.
- **Order History:** Comprehensive tracking of all past and current purchases.

### 🔐 Security & Core Logistics
- **Role-Based Access Control (RBAC):** Complete separation of Farmer and Buyer workflows and permissions.
- **Secure Authentication:** Robust login/registration system with encrypted credentials.
- **Mobile-Responsive UI:** Fully optimized experience across mobile devices, tablets, and desktops.

---

## 📦 Project Structure

```text
capestonePro/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components & Layouts
│   │   ├── context/        # Auth & Cart Global State
│   │   ├── pages/          # Main application views (Analytics, Marketplace, etc.)
│   │   └── App.jsx         # Application routing and structure
├── server/                 # Express Backend
│   ├── models/             # Mongoose Schemas (User, Product, Order)
│   ├── routes/             # RESTful API Endpoints
│   ├── controllers/        # Business logic & Route handlers
│   ├── middleware/         # Security & Upload middlewares
│   └── uploads/            # Static storage for product images
├── docker-compose.yml     # Container orchestration for easy deployment
└── README.md               # Project documentation
```

---

## ⚙️ Installation & Setup

### 1. Prerequisites
- **Node.js** (v18.0 or higher recommended)
- **MongoDB** (Local instance or MongoDB Atlas)
- **Git**

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/capestonePro.git
cd capestonePro
```

### 3. Backend Configuration
Navigate to the `server` directory and install dependencies:
```bash
cd server
npm install
```
Create a `.env` file in the `server` root:
```env
PORT=5000
MONGO_URI=mongodb://your_connection_string
JWT_SECRET=your_secret_key
```
Start the server:
```bash
npm run dev
```

### 4. Frontend Configuration
Navigate to the `client` directory and install dependencies:
```bash
cd client
npm install
```
Start the development server:
```bash
npm run dev
```

---

## 🐳 Docker Deployment
You can also run the entire stack using Docker:
```bash
docker-compose up --build
```

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---

### Developed as a Capstone Project to revolutionize agricultural supply chains.

