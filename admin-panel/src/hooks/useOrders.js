import { useEffect, useMemo, useState } from "react";
import { getOrders, updateOrderStatus } from "../services/orderService";
import { getAdminApiErrorMessage } from "../services/api";

const ITEMS_PER_PAGE = 6;

function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionKey, setActionKey] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getOrders();
      setOrders(data);
    } catch (requestError) {
      setOrders([]);
      setError(getAdminApiErrorMessage(requestError, "Something went wrong while loading orders."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const summary = useMemo(
    () => ({
      total: orders.length,
      delivered: orders.filter((order) => order.status === "Delivered").length,
      pending: orders.filter((order) => (order.status || order.orderStatus || "Pending") === "Pending").length
    }),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return orders;
    }

    return orders.filter((order) =>
      [
        order._id,
        order.status,
        order.orderStatus,
        order.user?.name,
        order.user?.email
      ]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }, [orders, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [currentPage, filteredOrders]);

  const handleStatusUpdate = async (orderId, status) => {
    setActionKey(`${orderId}-${status}`);
    setError("");

    try {
      const updatedOrder = await updateOrderStatus(orderId, status);
      setOrders((currentOrders) =>
        currentOrders.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
      );
    } catch (requestError) {
      setError(getAdminApiErrorMessage(requestError, "Something went wrong while updating the order."));
    } finally {
      setActionKey("");
    }
  };

  return {
    actionKey,
    currentPage,
    error,
    filteredOrders,
    handleStatusUpdate,
    itemsPerPage: ITEMS_PER_PAGE,
    loading,
    orders,
    paginatedOrders,
    searchTerm,
    setCurrentPage,
    setSearchTerm,
    summary,
    totalPages
  };
}

export default useOrders;
