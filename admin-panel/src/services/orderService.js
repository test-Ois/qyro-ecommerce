import API from "./api";

export const getOrders = async () => {
  const { data } = await API.get("/orders");
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
};

export const updateOrderStatus = async (orderId, status) => {
  const { data } = await API.put(`/orders/${orderId}/status`, { status });
  return data?.data || data;
};
