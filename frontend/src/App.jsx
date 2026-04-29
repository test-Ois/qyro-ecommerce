import { useEffect, useState, useContext } from "react";
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
