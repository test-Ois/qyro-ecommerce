import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import AddProduct from "../pages/AddProduct";
import AdminPending from "../pages/AdminPending";
import AdminRegister from "../pages/AdminRegister";
import AdminUsers from "../pages/AdminUsers";
import Dashboard from "../pages/Dashboard";
import EditProduct from "../pages/EditProduct";
import Login from "../pages/Login";
import OrderDetails from "../pages/OrderDetails";
import Orders from "../pages/Orders";
import Products from "../pages/Products";
import Sellers from "../pages/Sellers";
import Users from "../pages/Users";

const withAdminLayout = (page) => <AdminLayout>{page}</AdminLayout>;

function AdminRoutes() {
  return (
    <Routes>
      {/* ===== PUBLIC ROUTES ===== */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<AdminRegister />} />
      <Route path="/pending" element={<AdminPending />} />

      {/* ===== PROTECTED ROUTES — admin + super_admin ===== */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={withAdminLayout(<Dashboard />)} />
        <Route path="/products" element={withAdminLayout(<Products />)} />
        <Route path="/add-product" element={withAdminLayout(<AddProduct />)} />
        <Route path="/edit-product/:id" element={withAdminLayout(<EditProduct />)} />
        <Route path="/orders" element={withAdminLayout(<Orders />)} />
        <Route path="/orders/:id" element={withAdminLayout(<OrderDetails />)} />
        <Route path="/users" element={withAdminLayout(<Users />)} />
        <Route path="/sellers" element={withAdminLayout(<Sellers />)} />
      </Route>

      {/* ===== SUPER ADMIN ONLY ROUTES ===== */}
      <Route element={<ProtectedRoute requiredRole="super_admin" />}>
        <Route path="/admin-users" element={withAdminLayout(<AdminUsers />)} />
      </Route>

      {/* ===== DEFAULT ===== */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AdminRoutes;
