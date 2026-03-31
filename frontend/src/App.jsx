import { useEffect, useState, useContext } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { io } from "socket.io-client";

import Footer from "./components/footer/Footer"; 

import SplashScreen from "./components/SplashScreen";
import Loader from "./components/Loader";

import { AuthContext } from "./context/AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import ChatWidget from "./components/ChatWidget";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import AccountDetails from "./pages/AccountDetails";
import CustomerService from "./pages/CustomerService";
import SellerPending from "./pages/SellerPending";
import SellerDashboard from "./pages/SellerDashboard";
import ProductPage from "./features/product/pages/ProductPage";
import Cart from "./pages/Cart";
import Success from "./pages/Success";
import AddProduct from "./features/product/pages/AddProduct";
import EditProduct from "./features/product/pages/EditProduct";

import "./App.css";

const socket = io("http://localhost:5000");

function AppContent() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // 🔥 STAGE CONTROL
  const [stage, setStage] = useState("splash");
  // splash → loader → skeleton → app

  const hideChatRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
    "/checkout",
    "/success",
    "/seller-dashboard",
    "/seller-pending",
    "/customer-service",
    "/add-product"
  ];

  const shouldShowChat =
    !hideChatRoutes.includes(location.pathname) &&
    !location.pathname.startsWith("/seller/products/edit/");

  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );
  const [notifications, setNotifications] = useState([]);

  // ✅ STAGE TIMING (MAIN LOGIC)
  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setStage("loader");
    }, 2200);

    const loaderTimer = setTimeout(() => {
      setStage("skeleton");
    }, 3000);

    const finalTimer = setTimeout(() => {
      setStage("app");
    }, 5000);

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(loaderTimer);
      clearTimeout(finalTimer);
    };
  }, []);

  // ✅ CART SAVE
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ✅ SOCKET
  useEffect(() => {
    if (user) {
      socket.emit("join", user.id);

      socket.on("order-status-update", (data) => {
        setNotifications((prev) => [data, ...prev]);

        if (Notification.permission === "granted") {
          new Notification("Qyro Order Update", {
            body: data.message
          });
        }
      });
    }

    return () => {
      socket.off("order-status-update");
    };
  }, [user]);

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // ✅ CART FUNCTIONS
  const addToCart = (product) => {
    setCart((prev) => {
      const exist = prev.find((item) => item._id === product._id);

      if (exist) {
        return prev.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const increaseQty = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item._id === id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  const decreaseQty = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item._id === id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeItem = (id) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  const totalPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (acc, item) => acc + item.quantity,
    0
  );

  // ✅ UI FLOW
  if (stage === "splash") {
    return <SplashScreen onFinished={() => setStage("loader")} />;
  }

  if (stage === "loader") {
    return <Loader onFinish={() => setStage("skeleton")} />;
  }

  if (stage === "skeleton") {
  return (
    <>
      <Navbar
        totalItems={totalItems}
        notifications={notifications}
        setNotifications={setNotifications}
      />
      <Home/>
      <Footer />   {/* 👈 add this */}
    </>
  );
}

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar
        totalItems={totalItems}
        notifications={notifications}
        setNotifications={setNotifications}
      />

      <main className="flex-1">

      <Routes>
        <Route path="/" element={<Home addToCart={addToCart} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected user routes */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute requireAuth={true}>
              <Checkout cart={cart} totalPrice={totalPrice} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute requireAuth={true}>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute requireAuth={true}>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        <Route
          path="/account"
          element={
            <ProtectedRoute requireAuth={true}>
              <AccountDetails />
            </ProtectedRoute>
          }
        />

        <Route path="/customer-service" element={<CustomerService />} />

        {/* Seller routes */}
        <Route path="/seller-pending" element={<SellerPending />} />

        <Route
          path="/seller-dashboard"
          element={
            <ProtectedRoute requiredRole="seller" requireApprovedSeller={true}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-product"
          element={
            <ProtectedRoute requiredRole="seller" requireApprovedSeller={true}>
              <AddProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/seller/products/edit/:id"
          element={
            <ProtectedRoute requiredRole="seller" requireApprovedSeller={true}>
              <EditProduct />
            </ProtectedRoute>
          }
        />

        {/* Product pages */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/success" element={<Success />} />
        <Route path="/product/:id" element={<ProductPage />} />
      </Routes>
      </main>

      {shouldShowChat && <ChatWidget />}
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;