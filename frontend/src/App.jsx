import { useEffect, useState, useContext, useRef } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { io } from "socket.io-client";

import Footer from "./components/footer/Footer";
import SplashScreen from "./components/SplashScreen";
import Loader from "./components/Loader";

import { AuthContext } from "./context/AuthContext";

import AppRoutes from "./routes/AppRoutes";
import MainLayout from "./layouts/MainLayout";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";

import "./App.css";

// Socket is NOT created at module level — only connected when needed
// This prevents crashes when backend is down and stops guest users
// from triggering WebSocket connections

function AppContent() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const socketRef = useRef(null);

  // 🔥 STAGE CONTROL: splash → loader → skeleton → app
  const [stage, setStage] = useState("splash");

  const hideChatRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
    "/checkout",
    "/success",
    "/seller/dashboard",
    "/seller-dashboard",
    "/seller-pending",
    "/customer-service",
    "/add-product",
    "/seller/products/add"
  ];

  const shouldShowChat =
    !hideChatRoutes.includes(location.pathname) &&
    !location.pathname.startsWith("/seller/products/edit/");

  const [cart, setCart] = useState(
    JSON.parse(localStorage.getItem("cart")) || []
  );
  const [notifications, setNotifications] = useState([]);

  // ✅ STAGE TIMING
  useEffect(() => {
    const splashTimer = setTimeout(() => setStage("loader"), 2200);
    const loaderTimer = setTimeout(() => setStage("skeleton"), 3000);
    const finalTimer = setTimeout(() => setStage("app"), 5000);

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

  // ✅ SOCKET — only connect when user is authenticated
  // Moved from module level to avoid crash when backend is offline
  useEffect(() => {
    if (!user) {
      // Disconnect if user logs out
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect socket for authenticated users only
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

    socketRef.current = io(SOCKET_URL, {
      reconnectionAttempts: 3,
      timeout: 5000,
      transports: ["websocket"]
    });

    socketRef.current.emit("join", user.id);

    socketRef.current.on("order-status-update", (data) => {
      setNotifications((prev) => [data, ...prev]);

      if (Notification.permission === "granted") {
        new Notification("Qyro Order Update", { body: data.message });
      }
    });

    socketRef.current.on("connect_error", () => {
      // Silently handle connection failures — don't break the UI
      console.warn("Socket connection failed — real-time updates unavailable");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("order-status-update");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  // ✅ NOTIFICATION PERMISSION
  useEffect(() => {
    if (user && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [user]);

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
        <Home />
        <Footer />
      </>
    );
  }

  return (
    <MainLayout
      totalItems={totalItems}
      notifications={notifications}
      setNotifications={setNotifications}
      shouldShowChat={shouldShowChat}
    >
      <AppRoutes addToCart={addToCart} cart={cart} totalPrice={totalPrice} />
    </MainLayout>
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
