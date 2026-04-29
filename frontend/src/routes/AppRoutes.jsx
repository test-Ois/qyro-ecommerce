import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AccountDetails from "../pages/AccountDetails";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import CustomerService from "../pages/CustomerService";
import ForgotPassword from "../pages/ForgotPassword";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Orders from "../pages/Orders";
import Products from "../pages/Products";
import Register from "../pages/Register";
import ResetPassword from "../pages/ResetPassword";
import SellerDashboard from "../pages/SellerDashboard";
import SellerPending from "../pages/SellerPending";
import Success from "../pages/Success";
import VerifyOTP from "../pages/VerifyOTP";
import Wishlist from "../pages/Wishlist";
import AddProduct from "../features/product/pages/AddProduct";
import EditProduct from "../features/product/pages/EditProduct";
import ProductPage from "../features/product/pages/ProductPage";

function AppRoutes({ addToCart, cart, totalPrice }) {
  return (
    <Routes>
      <Route path="/" element={<Home addToCart={addToCart} />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/products" element={<Products />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify-otp" element={<VerifyOTP />} />
      <Route path="/reset-password" element={<ResetPassword />} />

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

      <Route path="/customer-service" element={<CustomerService />} />
      <Route path="/seller-pending" element={<SellerPending />} />

      <Route
        path="/seller-dashboard"
        element={
          <ProtectedRoute requiredRole="seller" requireApprovedSeller>
            <SellerDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-product"
        element={
          <ProtectedRoute requiredRole="seller" requireApprovedSeller>
            <AddProduct />
          </ProtectedRoute>
        }
      />

      <Route
        path="/seller/products/edit/:id"
        element={
          <ProtectedRoute requiredRole="seller" requireApprovedSeller>
            <EditProduct />
          </ProtectedRoute>
        }
      />

      <Route path="/cart" element={<Cart />} />
      <Route path="/success" element={<Success />} />
      <Route path="/product/:id" element={<ProductPage />} />
    </Routes>
  );
}

export default AppRoutes;
