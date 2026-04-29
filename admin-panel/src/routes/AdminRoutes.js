import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import AddProduct from "../pages/AddProduct";
import Dashboard from "../pages/Dashboard";
import EditProduct from "../pages/EditProduct";
import OrderDetails from "../pages/OrderDetails";
import Orders from "../pages/Orders";
import Products from "../pages/Products";
import Sellers from "../pages/Sellers";
import Users from "../pages/Users";

const withAdminLayout = (page) => <AdminLayout>{page}</AdminLayout>;

function AdminRoutes() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={withAdminLayout(<Dashboard />)} />
        <Route path="/products" element={withAdminLayout(<Products />)} />
        <Route path="/add-product" element={withAdminLayout(<AddProduct />)} />
        <Route path="/edit-product/:id" element={withAdminLayout(<EditProduct />)} />
        <Route path="/orders" element={withAdminLayout(<Orders />)} />
        <Route path="/orders/:id" element={withAdminLayout(<OrderDetails />)} />
        <Route path="/users" element={withAdminLayout(<Users />)} />
        <Route path="/sellers" element={withAdminLayout(<Sellers />)} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Route>
    </Routes>
  );
}

export default AdminRoutes;
