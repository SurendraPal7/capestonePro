# Farmer-to-Buyer Marketplace

## Project Overview

The **Farmer-to-Buyer Marketplace** is a web-based platform designed to connect farmers directly with buyers, such as restaurant owners, hotel managers, and other bulk purchasers. By eliminating intermediaries, the platform ensures that farmers get better prices for their produce while buyers receive fresh, high-quality agricultural products directly from the source.

The application features a dual-role system where users can register as either a **Farmer (Seller)** or a **Buyer**. Farmers can list their produce with images and prices, while buyers can browse the marketplace, add items to their cart, and place orders.

## Key Features

-   **User Roles**:
    -   **Farmer**: Can list products (fruits, vegetables, etc.), manage inventory, and view incoming orders.
    -   **Buyer**: Can browse the marketplace, search for products, add items to a cart, and place orders.
-   **Authentication**: Secure login and registration system with role-based access control.
-   **Marketplace**: A visual display of available products with details enabling easy browsing.
-   **Product Management**: Farmers can upload product images and details.
-   **Order Management**:
    -   Buyers can track their order history.
    -   Farmers can view and manage orders received for their products.
-   **Dashboard**: Personalized dashboards for both Farmers and Buyers to manage their respective activities.

## Tech Stack

The project is built using the **MERN Stack** (MongoDB, Express.js, React, Node.js).

### Client-Side (Frontend)
-   **React**: UI library for building the user interface.
-   **Vite**: Build tool for faster development and optimized production builds.
-   **React Router DOM**: For handling navigation and routing.
-   **Axios**: For making HTTP requests to the backend API.
-   **CSS / CSS Modules**: For styling components and pages.

### Server-Side (Backend)
-   **Node.js**: Runtime environment for executing JavaScript on the server.
-   **Express.js**: Web framework for building the API.
-   **MongoDB**: NoSQL database for storing user, product, and order data.
-   **Mongoose**: ODM (Object Data Modeling) library for MongoDB.
-   **JWT (JSON Web Tokens)**: For secure user authentication.
-   **Bcryptjs**: For password hashing.
-   **Multer**: For handling file uploads (product images).
-   **Dotenv**: For managing environment variables.
-   **Nodemon**: For automatic server restarts during development.

## Prerequisites

Before running the project, ensure you have the following installed:
-   **Node.js** (v14 or higher)
-   **npm** (Node Package Manager)
-   **MongoDB** (Local instance or Atlas connection string)

## Installation and Workflow

Follow these steps to set up and run the project locally.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd capestonePro
```

### 2. Backend Setup (Server)

Navigate to the `server` directory and install dependencies:

```bash
cd server
npm install
```

Create a `.env` file in the `server` directory with the following variables:

```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/farmer-marketplace
JWT_SECRET=your_jwt_secret_key_here
```

Start the backend server:

```bash
npm start
# OR for development with auto-restart:
npm run dev
```

The server should now be running on `http://localhost:5000`.

### 3. Frontend Setup (Client)

Open a new terminal, navigate to the `client` directory, and install dependencies:

```bash
cd client
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The application will typically run on `http://localhost:5173` (check the terminal output for the exact URL).

## Project Structure

```
capestonePro/
├── client/                 # Frontend React Application
│   ├── public/             
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Auth, Cart, etc.)
│   │   ├── pages/          # Application pages (Home, Login, Marketplace, etc.)
│   │   ├── App.jsx         # Main application component
│   │   └── main.jsx        # Entry point
│   ├── package.json        # Client dependencies and scripts
│   └── vite.config.js      # Vite configuration
│
├── server/                 # Backend Node.js/Express Application
│   ├── config/             # Database configuration
│   ├── controllers/        # Route logic and handlers
│   ├── middleware/         # Custom middleware (Auth, Error handling)
│   ├── models/             # Mongoose schemas (User, Product, Order)
│   ├── routes/             # API routes
│   ├── uploads/            # Directory for uploaded images
│   ├── index.js            # Server entry point
│   └── package.json        # Server dependencies and scripts
│
└── README.md               # Project documentation
```

## API Endpoints

-   **Auth**:
    -   `POST /api/auth/register`: Register a new user.
    -   `POST /api/auth/login`: Login user.
    -   `GET /api/auth/me`: Get current user profile.
-   **Products**:
    -   `GET /api/products`: Get all products.
    -   `POST /api/products`: Add a new product (Farmer only).
-   **Orders**:
    -   `POST /api/orders`: Place a new order.
    -   `GET /api/orders/myorders`: Get orders for the logged-in user.
-   **Upload**:
    -   `POST /api/upload`: Upload an image file.

## Troubleshooting

-   **Database Connection Error**: Ensure your local MongoDB instance is running or your `MONGO_URI` is correct.
-   **CORS Issues**: If the frontend cannot communicate with the backend, ensure `cors` is enabled in `server/index.js`.
-   **Image Displays**: Images are served statically from the `server/uploads` folder. Ensure this folder exists and permissions are set correctly.

---

This project was developed as a Capstone Project demonstrating full-stack web development capabilities.
