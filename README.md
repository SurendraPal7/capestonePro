# 🚜 Farmer-to-Buyer Marketplace

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Deployment-Docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A state-of-the-art, full-stack digital marketplace designed to bridge the gap between local farmers and bulk buyers. By eliminating intermediaries, we empower producers to take control of their business while ensuring buyers receive the freshest produce at fair market prices.

---

## 🚀 The Problem Statement

The agricultural industry, despite being the backbone of the economy, suffers from a fragmented and inefficient supply chain. Farmers today face several critical challenges:

1.  **Exploitative Intermediaries:** Traditionally, produce passes through multiple brokers and wholesalers. Each layer takes a commission, often leaving the farmer with less than 30% of the final consumer price.
2.  **Price Manipulation:** Without direct access to market demand data, farmers are forced to accept "take-it-or-leave-it" prices dictated by local middlemen.
3.  **High Post-Harvest Wastage:** Inefficient logistics and long supply chains lead to significant spoilage of perishable goods before they reach the actual buyer.
4.  **Limited Market Reach:** Small-scale farmers lack the digital tools to connect with high-volume purchasers like restaurants, hotels, and retail chains, confining them to local, low-yield markets.

---

## 💡 Proposed Solution

The **Farmer-to-Buyer Marketplace** is a "Digital Bridge" built to decentralize agricultural trade. Our solution provides a direct, transparent Peer-to-Peer (P2P) platform where farmers can list their harvest and buyers can purchase in bulk without any hidden fees or middlemen. 

By leveraging modern web technologies and a secure, data-driven architecture, we provide a marketplace that is as efficient as modern e-commerce but tailored specifically for the unique needs of agriculture.

---

## 👨‍🌾 How It Empowers Farmers

This platform is more than just a listing site; it is a business management tool for the modern farmer:

*   **Economic Empowerment:** By selling directly, farmers can increase their profit margins by **40-60%** by capturing the value previously lost to intermediaries.
*   **Direct Market Access:** Farmers can now reach bulk buyers across the region, expanding their customer base beyond their immediate physical vicinity.
*   **Data-Driven Insights:** Integrated analytics allow farmers to track sales trends, understand seasonal demand, and make informed decisions about what to plant next.
*   **Reduced Wastage:** Direct communication with buyers allows for faster turnover of perishable goods, ensuring that produce reaches the table while it's still fresh.

---

## ✨ Key Features

### 🌾 For Farmers (Sellers)
*   **Product Management:** Easy-to-use interface for listing produce with photos, quantity units, and dynamic pricing.
*   **Advanced Analytics Dashboard:** Real-time visualization of sales, revenue, and order trends using interactive charts.
*   **Order Fulfillment Tracking:** A streamlined workflow to manage incoming orders from placement to completion.
*   **Earnings Overview:** Transparent tracking of total revenue and business growth.

### 🛒 For Buyers (Purchasers)
*   **Live Marketplace:** Browse fresh, verified agricultural products directly from the source.
*   **Seamless Procurement:** A robust shopping cart and checkout system designed for bulk purchasing.
*   **Direct Communication:** Contact farmers directly to discuss quality, volume, and logistics.
*   **Order History:** Maintain a digital record of all previous transactions for easier bookkeeping.

---

## 🛠️ Technology Stack

### **Frontend**
*   **React.js & Vite:** For a lightning-fast, responsive user interface.
*   **Recharts:** Powering the complex data visualizations on the farmer's dashboard.
*   **Context API:** Managed global state for authentication and shopping cart logic.
*   **Tailored CSS:** A premium, modern UI designed for high engagement.

### **Backend**
*   **Node.js & Express.js:** A scalable architecture for handling concurrent marketplace transactions.
*   **JWT & Bcrypt:** Industry-standard security for user authentication and data protection.
*   **Multer:** Optimized handling of product image uploads and cloud storage integration.

### **Database & Infrastructure**
*   **MongoDB:** Flexible NoSQL database for handling varied agricultural product schemas.
*   **Docker:** Containerized deployment for a consistent "it works on my machine" experience across all environments.

---

## 🐳 Quick Start (Docker)

The fastest way to get the project running is using Docker.

1.  **Clone the Repository:**
    ```bash
    git clone https://github.com/SurendraPal7/capestonePro.git
    cd capestonePro
    ```
2.  **Run with Docker Compose:**
    ```bash
    docker-compose up --build
    ```
3.  **Access the App:**
    *   Frontend: [http://localhost](http://localhost)
    *   Backend API: [http://localhost:5000](http://localhost:5000)

---

## ⚙️ Manual Installation (Development)

If you prefer to run the components separately:

### 1. Backend Setup
```bash
cd server
npm install
# Create a .env file with PORT, MONGO_URI, and JWT_SECRET
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

### Developed as a Capstone Project to revolutionize agricultural supply chains.
