import { useEffect, useState } from "react";
import API from "../services/api";
import { generateInvoice } from "../utils/generateInvoice";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoadingId, setCancelLoadingId] = useState("");

  useEffect(() => {
    document.title = "Qyro Orders";
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await API.get("/orders/my");
      setOrders(Array.isArray(res.data) ? res.data : res.data.orders || []);
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) return;

    try {
      setCancelLoadingId(orderId);

      await API.put(`/orders/${orderId}/cancel`);

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId
            ? { ...order, status: "Cancelled" }
            : order
        )
      );

      alert("Order cancelled successfully");
    } catch (error) {
      console.error("Cancel order error:", error);
      alert(error.response?.data?.message || "Something went wrong while cancelling order");
    } finally {
      setCancelLoadingId("");
    }
  };

  const getStatusClasses = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-500/15 text-green-400 border-green-500/20";
      case "Shipped":
        return "bg-blue-500/15 text-blue-400 border-blue-500/20";
      case "Cancelled":
        return "bg-red-500/15 text-red-400 border-red-500/20";
      default:
        return "bg-yellow-500/15 text-yellow-300 border-yellow-500/20";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070014] px-4 py-8 text-white">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 h-8 w-40 animate-pulse rounded bg-white/10" />

          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="rounded-3xl border border-white/10 bg-[#120422] p-6"
              >
                <div className="mb-4 h-6 w-56 animate-pulse rounded bg-white/10" />
                <div className="mb-3 h-4 w-32 animate-pulse rounded bg-white/10" />
                <div className="mb-6 h-4 w-28 animate-pulse rounded bg-white/10" />

                <div className="space-y-3">
                  <div className="h-16 w-full animate-pulse rounded-2xl bg-white/10" />
                  <div className="h-16 w-full animate-pulse rounded-2xl bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070014] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Your Orders
          </h1>
          <p className="mt-2 text-sm text-gray-400">
            Yahan tumhare saare placed orders show honge.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-[#120422] p-10 text-center">
            <div className="text-5xl">📦</div>
            <h2 className="mt-4 text-2xl font-bold text-white">
              No orders found
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Abhi tak tumne koi order place nahi kiya.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const orderStatus = order.status || order.orderStatus || "Pending";
              const canCancel =
                orderStatus === "Pending" || orderStatus === "Processing";

              return (
                <div
                  key={order._id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-[#120422] shadow-xl"
                >
                  <div className="border-b border-white/10 p-5 sm:p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-white sm:text-xl">
                          Order ID: {order._id}
                        </h2>
                        <p className="mt-2 text-sm text-gray-300">
                          Total:{" "}
                          <span className="font-semibold text-yellow-400">
                            ₹{order.totalPrice}
                          </span>
                        </p>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          orderStatus
                        )}`}
                      >
                        {orderStatus}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6">
                    <h3 className="mb-4 text-base font-semibold text-white">
                      Items
                    </h3>

                    <div className="space-y-3">
                      {order.products?.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
                        >
                          {item.image || item.product?.image ? (
                            <img
                              src={item.image || item.product?.image}
                              alt={item.name || item.product?.name || "Product"}
                              className="h-16 w-16 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white/10 text-xs text-gray-400">
                              No Image
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-white sm:text-base">
                              {item.name || item.product?.name || "Product"}
                            </p>

                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                              <span>Qty: {item.quantity}</span>

                              {item.size && (
                                <span className="rounded-full bg-white/5 px-2 py-1">
                                  Size: {item.size}
                                </span>
                              )}

                              {item.color && (
                                <span className="rounded-full bg-white/5 px-2 py-1 capitalize">
                                  Color: {item.color}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        onClick={() => generateInvoice(order)}
                        className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                      >
                        📄 Download Invoice
                      </button>

                      {canCancel && (
                        <button
                          onClick={() => handleCancelOrder(order._id)}
                          disabled={cancelLoadingId === order._id}
                          className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
                            cancelLoadingId === order._id
                              ? "cursor-not-allowed bg-red-900/60"
                              : "bg-red-600 hover:bg-red-500"
                          }`}
                        >
                          {cancelLoadingId === order._id
                            ? "Cancelling..."
                            : "Cancel Order"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;