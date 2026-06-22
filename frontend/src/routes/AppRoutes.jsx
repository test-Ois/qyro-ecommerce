import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

/* ===== PUBLIC pages ===== */
import Home from "../pages/Home";
import Products from "../pages/Products";
import ForgotPassword from "../pages/ForgotPassword";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ResetPassword from "../pages/ResetPassword";
import VerifyOTP from "../pages/VerifyOTP";
import CustomerService from "../pages/CustomerService";
import Success from "../pages/Success";

/* ===== Product feature ===== */
import ProductPage from "../features/product/pages/ProductPage";

/* ===== Customer-only pages (require login) ===== */
import AccountDetails from "../pages/AccountDetails";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import Wishlist from "../pages/Wishlist";

/* ===== Seller portal pages (require login + approved seller) ===== */
import SellerDashboard from "../pages/SellerDashboard";
import SellerPending from "../pages/SellerPending";
import AddProduct from "../features/product/pages/AddProduct";
import EditProduct from "../features/product/pages/EditProduct";

function AppRoutes({ addToCart, cart, totalPrice }) {
  return (
    <Routes>

      {/* ============================================================
          PUBLIC ROUTES — No authentication required
          Behaves like Amazon: products visible to all guests
          ============================================================ */}
      <Route path="/" element={<Home addToCart={addToCart} />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductPage />} />
      <Route path="/customer-service" element={<CustomerService />} />
      <Route path="/success" element={<Success />} />

      {/* Auth pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ============================================================
          CUSTOMER PROTECTED ROUTES — Authentication required
          Cart accessible without login (content from localStorage),
          but Checkout/Orders/Wishlist/Profile require auth
          ============================================================ */}
      <Route path="/cart" element={<Cart />} />

      <Route
        path="/checkout"
        element={
          <ProtectedRoute requireAuth>
            <Checkout cart={cart} totalPrice={totalPrice} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/orders"
        element={
          <ProtectedRoute requireAuth>
            <Orders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/wishlist"
        element={
          <ProtectedRoute requireAuth>
            <Wishlist />
          </ProtectedRoute>
        }
      />

      <Route
        path="/account"
        element={
          <ProtectedRoute requireAuth>
            <AccountDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute requireAuth>
            <AccountDetails />
          </ProtectedRoute>
        }
      />

      {/* ============================================================
          SELLER PORTAL — /seller/* route group
          Requires authentication + approved seller role
          ============================================================ */}

      {/* Public seller routes */}
      <Route path="/seller-pending" element={<SellerPending />} />

      {/* Legacy redirect — keep old seller-dashboard URL working */}
      <Route
        path="/seller-dashboard"
        element={<Navigate to="/seller/dashboard" replace />}
      />
      <Route
        path="/add-product"
        element={<Navigate to="/seller/products/add" replace />}
      />

      {/* Seller protected routes under /seller/* */}
      <Route
        path="/seller/dashboard"
        element={
          <ProtectedRoute requireAuth requiredRole="seller" requireApprovedSeller>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/products/add"
        element={
          <ProtectedRoute requireAuth requiredRole="seller" requireApprovedSeller>
            <AddProduct />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/products/edit/:id"
        element={
          <ProtectedRoute requireAuth requiredRole="seller" requireApprovedSeller>
            <EditProduct />
          </ProtectedRoute>
        }
      />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
