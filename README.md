# 🛍️ Qyro E-commerce

🚀 A full-stack modern e-commerce platform built using the MERN stack with scalable architecture and premium UI/UX.

---

## 📌 Features

* 🔐 User Authentication (JWT Based)
* 🛒 Add to Cart & Checkout System
* 📦 Order Management
* 💬 Real-time Chat (Socket.io)
* 👤 User Profile & Dashboard
* 🧾 Product Management (Admin Panel)
* 🔍 Search & Filter Products
* 🌙 Dark Mode UI
* 🔔 Push Notifications
* 📁 File & Image Upload

---

## 🛠️ Tech Stack

### Frontend

* React.js
* Tailwind CSS
* Framer Motion

### Backend

* Node.js
* Express.js

### Database

* MongoDB

### Real-time

* Socket.io

---

## 📂 Project Structure

```
qyro-ecommerce/
│
├── client/          # React Frontend
├── server/          # Node + Express Backend
├── models/          # MongoDB Models
├── routes/          # API Routes
├── controllers/     # Business Logic
├── middleware/      # Auth & Error Handling
├── config/          # DB & Env Config
├── .env             # Environment Variables
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/test-Ois/qyro-ecommerce.git
cd qyro-ecommerce
```

### 2️⃣ Install dependencies

#### Backend

```bash
cd server
npm install
```

#### Frontend

```bash
cd client
npm install
```

---

### 3️⃣ Setup Environment Variables

📁 Create `.env` file inside `/server`

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

---

### 4️⃣ Run the project

#### Start Backend

```bash
cd server
npm run dev
```

#### Start Frontend

```bash
cd client
npm start
```

---

## 🌐 API Endpoints (Sample)

| Method | Endpoint      | Description    |
| ------ | ------------- | -------------- |
| POST   | /api/auth     | Register/Login |
| GET    | /api/products | Get Products   |
| POST   | /api/orders   | Create Order   |

---

## 📸 Screenshots

coming...

---

## 🚀 Deployment

* Frontend → Vercel / Netlify
* Backend → Render / Railway
* Database → MongoDB Atlas

---

## 🤝 Contributing

Pull requests are welcome. For major changes, open an issue first.

---

## 📧 Contact

👨‍💻 Qayoom Akhtar
📩 Email: [qayoomakhtar72@example.com](mailto:your-email@example.com)
🔗 GitHub: https://github.com/test-Ois

---

## ⭐ Support

If you like this project, give it a ⭐ on GitHub!
