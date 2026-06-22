# 🛍️ Qyro: AI-Powered Multi-Vendor E-Commerce Platform

🚀 Qyro is a production-ready, highly secure, full-stack e-commerce marketplace inspired by Amazon. Designed using the MERN stack (MongoDB, Express, React, Node.js), it implements a strict role-based access control (RBAC) architecture supporting Customers, Sellers, Admins, and Super Admins. With robust JWT-based session security, email OTP validations, real-time Socket.io support, and automated Cloudinary uploads, Qyro is built to perform at scale.

---

[![GitHub License](https://img.shields.io/github/license/test-Ois/qyro-ecommerce?style=for-the-badge&color=blue)](https://github.com/test-Ois/qyro-ecommerce/blob/main/LICENSE)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.2.1-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deploys-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Render](https://img.shields.io/badge/Render-Deploys-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com)

---

## 📌 1. Project Overview

Qyro mimics a fully-featured modern marketplace architecture where buyers can browse and purchase items, sellers can register and manage inventories, and admins/super admins maintain platform integrity. 

Key pillars of Qyro:
*   **Decoupled Multi-Portal Architecture**: Dedicated interfaces tailored to user roles (Customer Portal, Seller Portal, Admin Panel Dashboard).
*   **Security & Verification First**: Multi-stage sign-offs (seller/admin approvals), automatic session invalidation upon blocking, and robust HTTP headers.
*   **AI Integration**: Generative AI assistance and validation powered by the Google Gemini API.
*   **Smooth UX**: Micro-interactions, skeletons, dark mode, responsive tailwind UI, and automatic invoice generators.

---

## 📦 2. Platform Features

### 👤 Customer Features
*   **Guest Browsing**: View, filter, and search products without requiring authentication.
*   **Advanced Search & Filtering**: Locate items by keyword, categories, price range, and tags.
*   **Interactive Shopping Cart**: Add, edit quantity, and checkout products dynamically.
*   **Persistent Wishlist**: Save favorite items to purchase later.
*   **Order History & Invoicing**: Place orders, view histories, track status, and download PDFs generated using `jspdf`.
*   **Profile Management**: Update delivery address, contact details, and account settings.

### 🏪 Seller Features
*   **Seller Registration**: Simple signup flow to join the marketplace.
*   **Approval Queue**: Enters a pending state awaiting Admin review.
*   **Seller Dashboard**: Centralized view of earnings, order history, inventory counts, and top products.
*   **Product Catalog Management**: Create, edit, and delete products (supported by Cloudinary image upload and Gemini AI description validations).
*   **Order Management**: Track orders containing seller's items and update shipment status (Pending ➔ Processing ➔ Shipped ➔ Delivered).
*   **Sales Analytics**: View revenue graphs and order metrics.

### 🛡️ Admin Features
*   **Admin Registration**: Sign up securely (requires Super Admin approval).
*   **Seller Moderation**: Inspect seller applications, approve active accounts, or reject fraudulent registrations.
*   **User Management**: Monitor the lists of active customers and sellers on the platform.
*   **Product Moderation**: Oversee listings, update details, or delete violations.
*   **Order Moderation**: Review overall system orders and track delivery statuses.
*   **Analytics Dashboard**: View aggregate marketplace metrics (Total Revenue, Monthly Orders growth, Top 5 selling items).

### ⚡ Super Admin Features
*   **Admin Approvals**: Approve or reject newly registered administrative accounts.
*   **Sellers & Admins Promotion/Demotion**: Dynamically elevate an Admin to Super Admin, or demote a Super Admin back to standard Admin.
*   **Ultimate User Control**: Ban/unban any User, Seller, or Admin instantly (invalidates active JWTs to force immediate logout).
*   **Global Commission Control**: Edit seller commission rate % to adjust platform platform fees.

---

## 🛠️ 3. Technology Stack

### Frontend (Client Portals)
*   **Core Library**: React.js (v18 & v19)
*   **Routing**: React Router DOM (v6 & v7)
*   **State Management**: Context API
*   **HTTP Client**: Axios (configured with interceptors to automatically attach tokens and handle 401 expiries)
*   **Styling**: Tailwind CSS & Lucide Icons

### Backend (API Server)
*   **Runtime Environment**: Node.js
*   **Framework**: Express.js
*   **Database**: MongoDB (Atlas Cloud)
*   **Object Modeling (ODM)**: Mongoose
*   **Authentication**: JSON Web Tokens (JWT) & BcryptJS (password hashing)
*   **Logs**: Winston & Winston Daily Rotate File (for security audits and error tracking)

### Services & Integrations
*   **Cloud Storage**: Cloudinary (handled via Multer and Multer Storage Cloudinary)
*   **SMTP Service**: Nodemailer (handles 6-digit OTP mailings)
*   **Payment Gateway**: Razorpay Node SDK (prepared for checkout orders)
*   **AI Integration**: Google Generative AI (Gemini SDK)

### Deployment & Hosting
*   **Frontend Client**: Vercel (static deployments with rewrite support)
*   **Admin Panel**: Vercel (hosted separately on administrative subdomains)
*   **Backend Server**: Render (Node.js Web Service)

---

## 📐 4. System Architecture & Role Hierarchy

Qyro segregates concerns into distinct client applications interacting with a consolidated Express API backend.

```
                  ┌──────────────────────┐      ┌──────────────────────┐
                  │   Customer Portal    │      │     Admin Panel      │
                  │   (React Frontend)   │      │   (React Frontend)   │
                  └──────────┬───────────┘      └──────────┬───────────┘
                             │                             │
                             └──────────────┬──────────────┘
                                            │ HTTPS / WebSockets
                                            ▼
                  ┌────────────────────────────────────────────────────┐
                  │              Security Middleware                   │
                  │  (Rate Limiter, Helmet, CORS, Sanitizers, JWT RBAC)│
                  └─────────────────────────┬──────────────────────────┘
                                            │
                                            ▼
                  ┌────────────────────────────────────────────────────┐
                  │                 Express API Server                 │
                  └────┬──────────┬───────────┬──────────┬──────────┬──┘
                       │          │           │          │          │
                       ▼          ▼           ▼          ▼          ▼
                  ┌─────────┐┌──────────┐┌─────────┐┌─────────┐┌─────────┐
                  │  Auth   ││ Products ││ Orders  ││ Sellers ││ Chat/WS │
                  │ Service ││ Service  ││ Service ││ Service ││ Service │
                  └────┬────┘└────┬─────┘└────┬────┘└────┬────┘└────┬────┘
                       │          │           │          │          │
                       ▼          ▼           ▼          ▼          ▼
                  ┌────────────────────────────────────────────────────┐
                  │                 Database Storage                   │
                  │                   MongoDB Atlas                    │
                  └────────────────────────────────────────────────────┘
```

### 👑 Role Hierarchy
Permission levels cascade sequentially:
$$\text{customer} \prec \text{seller} \prec \text{admin} \prec \text{super\_admin}$$

*   **customer**: Default user type. Accesses shopping carts, checkout, wishlists, and orders.
*   **seller**: Inherits customer features + accesses inventory management, shipping controls, and dashboard analytics. Must be approved.
*   **admin**: Inherits seller controls + manages seller verification queue, blocks users/sellers, and moderates all catalog products.
*   **super_admin**: Absolute platform control. Approves and promotes admins, updates commissions, and holds global ban authorities.

---

## 🔐 5. Authentication & Registration Workflow

Qyro utilizes dual JWT (Access + Refresh) token authentication combined with OTP (One-Time Password) confirmations.

### JWT Access & Refresh Tokens
*   **Access Token**: Short-lived payload containing user ID and role. Attached to the HTTP `Authorization: Bearer <token>` header for authorized API requests.
*   **Refresh Token**: Long-lived token stored in the database. Used to request a new Access Token once it expires, preventing continuous login prompts.
*   **Revocation**: Logging out or blocking a user destroys the stored refresh token in the database, locking out unauthorized access immediately.

### OTP Verification & Password Reset
*   **Email Verification**: Upon sign-up, users must verify their email. A 6-digit cryptographic OTP is mailed to their address (valid for 10 minutes).
*   **Password Reset**: Requesting a password reset emails an OTP. Verifying this OTP grants a short-lived reset token used to authorize the `POST /api/auth/reset-password` transaction.

### User Registration & Approval Status Flow

```mermaid
flowchart TD
    Start([User Registration Initiated]) --> Role{Which Role?}
    
    Role -->|Customer| Cust[Role: customer <br> isApproved: true <br> approvalStatus: approved] --> Active[Create Session JWT Tokens]
    
    Role -->|Seller| Sell[Role: seller <br> isApproved: false <br> approvalStatus: pending] --> WaitSell[Enters Admin Review Queue]
    
    Role -->|Admin| Adm[Role: admin <br> isApproved: false <br> approvalStatus: pending] --> WaitAdm[Enters Super Admin Review Queue]

    WaitSell --> ApproveSell{Admin Decides}
    ApproveSell -->|Approve| AppS[isApproved: true <br> approvalStatus: approved] --> LoginS[Seller Dashboard Access Enabled]
    ApproveSell -->|Reject| RejS[isApproved: false <br> approvalStatus: rejected] --> BlockS[Access Terminated]

    WaitAdm --> ApproveAdm{Super Admin Decides}
    ApproveAdm -->|Approve| AppA[isApproved: true <br> approvalStatus: approved] --> LoginA[Admin Control Panel Access Enabled]
    ApproveAdm -->|Reject| RejA[isApproved: false <br> approvalStatus: rejected] --> BlockA[Access Terminated]
```

---

## ⚙️ 6. Installation & Local Setup

### Prerequisite Checklist
*   Node.js (v18.x or v20.x LTS)
*   MongoDB Atlas cluster connection string
*   Cloudinary credentials
*   SMTP Host/Credentials (e.g., Gmail App Passwords)

---

### Step 1: Clone and Install
Clone the codebase, navigate to the root folder, and run the monorepo installer script. This handles installing base, frontend, backend, and admin-panel dependencies simultaneously.

```bash
# Clone the repository
git clone https://github.com/test-Ois/qyro-ecommerce.git
cd qyro-ecommerce

# Install dependencies across all components at once
npm run install:all
```

---

### Step 2: Environment Configuration
Copy the `.env.example` blueprints and populate them with your own environment configurations.

1.  **Backend Configuration**: 
    Copy [backend/.env.example](file:///c:/Qyro/.env.example) to `backend/.env` and edit:
    ```bash
    cp .env.example backend/.env
    ```
2.  **Frontend Configuration**: 
    Copy [frontend/.env.example](file:///c:/Qyro/frontend/.env.example) to `frontend/.env`:
    ```bash
    cp frontend/.env.example frontend/.env
    ```
3.  **Admin Panel Configuration**: 
    Copy [admin-panel/.env.example](file:///c:/Qyro/admin-panel/.env.example) to `admin-panel/.env`:
    ```bash
    cp admin-panel/.env.example admin-panel/.env
    ```

*(Refer to the [Environment Variables](#-7-environment-variables) section below for details on each parameter)*

---

### Step 3: Seed the Super Admin Account
To access administrative functions, initialize a Super Admin user by setting the seeding parameters in `backend/.env` and executing the seed command.

```bash
# In backend/.env, uncomment and set values:
# SUPER_ADMIN_NAME=Super Admin
# SUPER_ADMIN_EMAIL=superadmin@qyro.com
# SUPER_ADMIN_PASSWORD=securepassword123

# Run the seeding script
npm run seed:super-admin
```
*(The script will register the Super Admin and mark them as verified/approved automatically).*

---

### Step 4: Run the Development Server
Execute the global dev command to run the backend, customer frontend, and administrative dashboard side-by-side:

```bash
npm run dev
```
*   **Customer Portal**: `http://localhost:3000`
*   **Admin Panel**: `http://localhost:3001`
*   **Backend Server**: `http://localhost:5000`

---

## 🔑 7. Environment Variables

### Backend Environment Variables (`backend/.env`)
Create this file based on the root [.env.example](file:///c:/Qyro/.env.example):

| Variable | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| **MONGO_URI** | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/qyro` |
| **JWT_SECRET** | Signature key for signing Access Tokens | *64-character base64 random string* |
| **JWT_REFRESH_SECRET** | Signature key for signing Refresh Tokens | *Different 64-character base64 random string* |
| **PORT** | Port of the API server | `5000` |
| **NODE_ENV** | Development environment setting | `development` (set to `production` in host) |
| **PRODUCTION_FRONTEND_URL**| Allowed CORS origin for production Customer portal| `https://qyro-store.vercel.app` |
| **PRODUCTION_ADMIN_URL** | Allowed CORS origin for production Admin panel | `https://qyro-admin.vercel.app` |
| **CLOUDINARY_CLOUD_NAME** | Cloudinary integration cloud name | *Your Cloudinary cloud name* |
| **CLOUDINARY_API_KEY** | Cloudinary integration API key | *Your Cloudinary API key* |
| **CLOUDINARY_API_SECRET** | Cloudinary integration API secret | *Your Cloudinary API secret* |
| **EMAIL_USER** | Gmail address used by Nodemailer to email OTPs| `noreply.qyro@gmail.com` |
| **EMAIL_PASS** | SMTP app password | *Gmail 16-character App Password* |
| **RAZORPAY_KEY** | Razorpay key identifier | *Your Razorpay API Key* |
| **RAZORPAY_SECRET** | Razorpay API key secret signature | *Your Razorpay Secret Key* |
| **GEMINI_API_KEY** | API Key for Gemini content moderation/AI helpers| *Your Google Gemini API Key* |

---

### Frontend Environment Variables (`frontend/.env`)
Create this file based on [frontend/.env.example](file:///c:/Qyro/frontend/.env.example):

| Variable | Description | Default / Recommended Value |
| :--- | :--- | :--- |
| **REACT_APP_API_URL** | Gateway endpoint mapping to backend API | `http://localhost:5000/api` |
| **REACT_APP_SOCKET_URL** | WebSocket gateway route for chat/notifs | `http://localhost:5000` |
| **REACT_APP_ADMIN_DASHBOARD_URL**| Administrative redirect destination link | `http://localhost:3001/dashboard` |

---

### Admin Panel Environment Variables (`admin-panel/.env`)
Create this file based on [admin-panel/.env.example](file:///c:/Qyro/admin-panel/.env.example):

| Variable | Description | Default / Recommended Value |
| :--- | :--- | :--- |
| **PORT** | Port for admin dev server | `3001` |
| **REACT_APP_API_URL** | Gateway endpoint mapping to backend API | `http://localhost:5000/api` |
| **REACT_APP_FRONTEND_URL** | Redirect route back to primary client store | `http://localhost:3000` |

---

## 🚀 8. Deployment Guide

### 1. Frontend & Admin Panel (Vercel)
Both frontends are configured for deployment to Vercel. SPA routing is supported via rewrite rules in `vercel.json` files.

#### Deploying via Vercel Dashboard:
1.  Import your repository into Vercel.
2.  **For Customer Frontend**:
    *   Set **Root Directory** to `frontend`.
    *   Configure **Environment Variables**:
        *   `REACT_APP_API_URL`: *Your production backend API URL (e.g., `https://qyro-backend.onrender.com/api`)*
        *   `REACT_APP_SOCKET_URL`: *Your production backend URL (e.g., `https://qyro-backend.onrender.com`)*
        *   `REACT_APP_ADMIN_DASHBOARD_URL`: *Your production Admin Panel URL*
3.  **For Admin Panel**:
    *   Set **Root Directory** to `admin-panel`.
    *   Configure **Environment Variables**:
        *   `REACT_APP_API_URL`: *Your production backend API URL*
        *   `REACT_APP_FRONTEND_URL`: *Your production Customer Portal URL*
4.  Deploy both apps. SPA client routing will work out-of-the-box thanks to the respective [vercel.json](file:///c:/Qyro/vercel.json) redirects.

---

### 2. Backend Server (Render)
The backend is set up for Render deployment using the unified blueprint configuration file [render.yaml](file:///c:/Qyro/render.yaml).

#### Deploying via Render Blueprint:
1.  Log in to Render and navigate to **Blueprints**.
2.  Connect your repository. Render will automatically parse the [render.yaml](file:///c:/Qyro/render.yaml) file.
3.  The service `qyro-backend` will be set up automatically with:
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
    *   **Root Directory**: `backend`
4.  Render will prompt you for variables without default values (e.g. `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `EMAIL_USER`, `EMAIL_PASS`). Provide your production secrets.
5.  Deploy the service. Copy the deployment URL (e.g. `https://qyro-backend.onrender.com`) to update your frontend environment parameters.

---

## 🛡️ 9. Production Security Features

Qyro implements comprehensive API hardening and data validation checks on every server endpoint:

1.  **JWT Separation of Duties**: Separates Access (authentication) and Refresh (session renewal) tokens. Refresh tokens are tracked in the database and are revoked if a user is blocked or logs out.
2.  **Role-Based Access Control (RBAC)**: Custom middlewares enforce strict permission validation (`authMiddleware.js`, `adminMiddleware.js`, `superAdminMiddleware.js`, and `roleMiddleware.js`).
3.  **MongoDB Injection Prevention**: Integrates `mongo-sanitize` to strip all query inputs of prefixed MongoDB operator tokens (like `$` or `.`), neutralizing NoSQL injection vectors.
4.  **Helmet Security Configuration**: Sets secure HTTP response headers to block cross-site scripting (XSS), frame sniffing, clickjacking, and enforce HTTPS transport (HSTS).
5.  **HTTP Parameter Pollution (HPP)**: Prevents query string parameter pollution (e.g., duplicated query fields to break search engines).
6.  **Granular Rate Limiting**: Uses `express-rate-limit` to apply:
    *   A general limit of `150 requests per 15 minutes` for standard endpoints.
    *   Stricter rate-limiting modules for sensitive targets like `/api/auth/login`, `/api/auth/register`, `/api/auth/send-otp`, and `/api/auth/reset-password` to prevent brute force attacks.
7.  **Payload Limits**: Body parsing is limited to `50kb` for JSON and URL-encoded payloads, preventing large inputs from causing memory overflows or Denial of Service (DoS) conditions.

---

## 🌐 10. Major API Endpoints

All routes are prefix-mapped under `/api/`.

| Method | Endpoint | Authorization | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Registers customer / seller (enters pending state) |
| **POST** | `/api/auth/admin-register`| Public | Registers an admin account (starts as pending) |
| **POST** | `/api/auth/login` | Public | Login credentials check; returns Access + Refresh token |
| **POST** | `/api/auth/send-otp` | Public | Generates and sends verification OTP |
| **POST** | `/api/auth/verify-otp` | Public | Validates OTP and updates verification status |
| **POST** | `/api/auth/reset-password`| Public | Updates password using validated OTP token |
| **POST** | `/api/auth/refresh-token` | Public | Refreshes expired Access Tokens using Refresh Token |
| **POST** | `/api/auth/logout` | Authenticated | Clears sessions; destroys the database refresh token |
| **GET** | `/api/products` | Public | Returns all products |
| **GET** | `/api/products/:id` | Public | Returns specific product detail |
| **POST** | `/api/products` | Seller / Admin | Adds a new product catalog listing |
| **PUT** | `/api/products/:id` | Seller / Admin | Edits product listings |
| **DELETE**| `/api/products/:id` | Seller / Admin | Removes product from marketplace catalog |
| **POST** | `/api/orders` | Customer | Places checkout order |
| **GET** | `/api/orders/my-orders` | Customer | Retrieves historical list of user orders |
| **PUT** | `/api/orders/:id/status` | Seller / Admin | Updates order shipping status |
| **GET** | `/api/seller/dashboard` | Seller | Analytics summary and items sales lists |
| **GET** | `/api/admin/stats` | Admin | Fetches revenue figures, user and order totals |
| **PUT** | `/api/admin/sellers/:id/approve`| Admin / Super Admin | Approves a seller application |
| **PUT** | `/api/admin/users/:id/block`| Admin / Super Admin | Bans user/seller; revokes tokens immediately |
| **GET** | `/api/admin/pending-admins`| Super Admin | Lists admins awaiting platform authorization |
| **PUT** | `/api/admin/admins/:id/approve`| Super Admin | Approves admin registration |
| **PUT** | `/api/admin/admins/:id/promote`| Super Admin | Promotes an admin to Super Admin |
| **PUT** | `/api/admin/admins/:id/demote`| Super Admin | Demotes Super Admin back to standard admin |

---

## 📂 11. Folder Structure

```
qyro-ecommerce/
├── admin-panel/                  # React Administrative Portal
│   ├── src/
│   │   ├── components/           # UI Skeletons, Sidebars, Navbars, Crop Modals
│   │   │   └── common/           # Input fields, buttons, card wrappers
│   │   ├── context/              # Auth state and validation hooks
│   │   ├── hooks/                # Custom hooks (orders, products tracking)
│   │   ├── layouts/              # Admin layout grid systems
│   │   ├── pages/                # AdminRegister, Users, Sellers, Products, Orders
│   │   ├── routes/               # Administrative protected page routing
│   │   ├── services/             # Axios API connectors
│   │   └── utils/                # Cropping helpers
│   ├── .env.example              # Admin environment variable template
│   ├── tailwind.config.js        # Admin styling layouts
│   └── vercel.json               # Vercel SPA rewrite rules
│
├── backend/                      # Node/Express API Server
│   ├── config/                   # MongoDB Atlas, Cloudinary configurations
│   ├── controllers/              # Core REST controller layers (Auth, Products, Orders, Admin)
│   ├── logs/                     # Winston automated logs (Auth, Combined, Errors)
│   ├── middlewares/              # Security sanitizers, RBAC roles, rate limits
│   ├── models/                   # Mongoose DB schema schemas (User, Product, Order, Otp)
│   ├── routes/                   # Endpoint mappings to controllers
│   ├── scripts/                  # Super Admin seeding, API smoke testing
│   ├── services/                 # Business logic abstractions (Auth, Seller, Order)
│   ├── utils/                    # Nodemailer SMTP mailers, API Response constructors
│   ├── validators/               # Joi request parameter validation rules
│   └── server.js                 # API Express server bootstrap
│
├── frontend/                     # Customer & Seller Portal
│   ├── src/
│   │   ├── components/           # Skeletons, Navbar, StoreNavigation, Chat widgets
│   │   ├── context/              # Core App Auth Context
│   │   ├── features/             # Specialized views (Product Page, Add/Edit forms)
│   │   ├── hooks/                # Timer counters, image optimizer hooks
│   │   ├── layouts/              # Main layout wraps
│   │   ├── pages/                # Checkout, Home, Dashboards, Verify OTP, CustomerService
│   │   ├── routes/               # Main navigation app routes
│   │   ├── services/             # Store APIs connection clients
│   │   └── utils/                # Invoice builders, Fallback images
│   ├── .env.example              # Client environment variable template
│   ├── tailwind.config.js        # Main UI CSS layout configurations
│   └── vercel.json               # Vercel SPA rewrite rules
│
├── render.yaml                   # Backend Render Deploy Blueprint
├── vercel.json                   # Monorepo vercel routing
├── package.json                  # Root monorepo task automation
└── README.md                     # Project blueprint
```

---

## 🗺️ 12. Project Roadmap

Future features and updates planned for Qyro:
*   **Real Razorpay Gateway Integration**: Swap sandbox mock payments with functional production webhook checks.
*   **Real-time Push Notifications**: Broaden Socket.io support for in-app alert prompts and delivery progress notifications.
*   **Product Reviews & Ratings**: Allow customers to submit reviews, star ratings, and upload photo feedback.
*   **Smart Inventory Notifications**: Automatically alert sellers when items fall below custom restock thresholds.
*   **Interactive AI Analytics**: Offer sellers AI-driven price recommendations and inventory forecasting.

---

## ✍️ 13. Author & Contributions

*   **Developer**: Qayoom Akhtar
*   **GitHub**: [@test-Ois](https://github.com/test-Ois)
*   **Email**: [qayoomakhtar72@gmail.com](mailto:qayoomakhtar72@gmail.com)

Feel free to open an issue or submit a pull request if you want to contribute to the growth and expansion of Qyro. Let's make commerce smarter together! 🚀
