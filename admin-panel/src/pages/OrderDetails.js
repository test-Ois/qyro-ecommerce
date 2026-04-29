import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

const panelClass =
  "rounded-[28px] border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl";
const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50";

const statusStyles = {
  Pending: "border-yellow-400/20 bg-yellow-500/15 text-yellow-200",
  Delivered: "border-emerald-400/20 bg-emerald-500/15 text-emerald-200",
  Cancelled: "border-red-400/20 bg-red-500/15 text-red-200",
  Shipped: "border-blue-400/20 bg-blue-500/15 text-blue-200"
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(value) || 0);

const formatDateTime = (value) =>
  new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });

function OrderDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await API.get(`/orders/${id}`);
        setOrder(data);
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message || "Something went wrong while loading the order.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const shippingLines = useMemo(() => {
    const shipping = order?.shippingAddress || {};
    return [
      shipping.address,
      [shipping.city, shipping.state].filter(Boolean).join(", "),
      [shipping.postalCode, shipping.country].filter(Boolean).join(", "),
      shipping.phone
    ].filter(Boolean);
  }, [order]);

  if (loading) {
    return (
      <div className={`${panelClass} p-6`}>
        <div className="space-y-3">
          <div className="h-10 w-48 animate-pulse rounded-xl bg-white/10" />
          <div className="h-48 w-full animate-pulse rounded-2xl bg-white/10" />
          <div className="h-48 w-full animate-pulse rounded-2xl bg-white/10" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={`${panelClass} p-10 text-center`}>
        <h2 className="text-2xl font-bold text-white">Order unavailable</h2>
        <p className="mt-3 text-sm text-gray-300">
          {error || "We could not load this order right now."}
        </p>
        <div className="mt-6">
          <button type="button" onClick={() => navigate("/orders")} className={secondaryButtonClass}>
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  const status = order.status || order.orderStatus || "Pending";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink-300">
            Order Details
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
            Order #{order._id.slice(-8).toUpperCase()}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
            Review the customer, line items, address details, and full order value from one screen.
          </p>
        </div>

        <button type="button" onClick={() => navigate("/orders")} className={secondaryButtonClass}>
          Back to Orders
        </button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.7fr,1.3fr]">
        <div className="space-y-6">
          <div className={`${panelClass} p-6`}>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-200">
              Order Summary
            </p>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Status</p>
                <span
                  className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                    statusStyles[status] || statusStyles.Pending
                  }`}
                >
                  {status}
                </span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Payment</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {order.paymentStatus || "Pending"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Total Price</p>
                <p className="mt-2 text-3xl font-extrabold text-emerald-200">
                  {formatCurrency(order.totalPrice)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Placed On</p>
                <p className="mt-2 text-sm text-gray-200">{formatDateTime(order.createdAt)}</p>
              </div>
            </div>
          </div>

          <div className={`${panelClass} p-6`}>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pink-200">
              User Info
            </p>
            <div className="mt-5 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Name</p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {order.user?.name || "Unknown User"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Email</p>
                <p className="mt-2 text-sm text-gray-200">
                  {order.user?.email || "No email available"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Role</p>
                <p className="mt-2 text-sm text-gray-200">{order.user?.role || "user"}</p>
              </div>
            </div>
          </div>

          <div className={`${panelClass} p-6`}>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-200">
              Shipping Address
            </p>
            {shippingLines.length > 0 ? (
              <div className="mt-5 space-y-2">
                {shippingLines.map((line) => (
                  <p key={line} className="text-sm text-gray-200">
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm text-gray-300">
                Shipping address was not captured for this order.
              </p>
            )}
          </div>
        </div>

        <div className={`${panelClass} p-6`}>
          <div className="border-b border-white/10 pb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pink-200">
              Order Items
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              {order.products?.length || 0} item{order.products?.length === 1 ? "" : "s"}
            </h2>
          </div>

          <div className="mt-6 space-y-4">
            {order.products?.map((item, index) => (
              <div
                key={`${item.product?._id || item._id || item.name}-${index}`}
                className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/10 p-5 md:flex-row md:items-center"
              >
                <div className="h-20 w-20 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                  {item.image || item.product?.image ? (
                    <img
                      src={item.image || item.product?.image}
                      alt={item.name || item.product?.name || "Order item"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.22em] text-gray-400">
                      Item
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <p className="text-lg font-semibold text-white">
                    {item.name || item.product?.name || "Unnamed item"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-300">
                    <span>Qty: {item.quantity || 1}</span>
                    <span>Price: {formatCurrency(item.price || item.product?.price)}</span>
                    {item.size && <span>Size: {item.size}</span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Line Total</p>
                  <p className="mt-2 text-lg font-bold text-emerald-200">
                    {formatCurrency((Number(item.price) || Number(item.product?.price) || 0) * (Number(item.quantity) || 1))}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
