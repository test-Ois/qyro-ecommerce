import { useNavigate } from "react-router-dom";
import useOrders from "../hooks/useOrders";

const panelClass =
  "rounded-[28px] border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl";
const inputClass =
  "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-300 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30";
const primaryButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:from-white/10 disabled:to-white/10 disabled:text-gray-400 disabled:hover:scale-100 disabled:hover:shadow-none";
const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50";

const statusStyles = {
  Pending: "border-yellow-400/20 bg-yellow-500/15 text-yellow-200",
  Delivered: "border-emerald-400/20 bg-emerald-500/15 text-emerald-200",
  Cancelled: "border-red-400/20 bg-red-500/15 text-red-200",
  Shipped: "border-blue-400/20 bg-blue-500/15 text-blue-200"
};

const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(amount);
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

function Orders() {
  const navigate = useNavigate();
  const {
    actionKey,
    currentPage,
    error,
    filteredOrders,
    handleStatusUpdate,
    itemsPerPage,
    loading,
    orders,
    paginatedOrders,
    searchTerm,
    setCurrentPage,
    setSearchTerm,
    summary,
    totalPages
  } = useOrders();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink-300">
            Orders
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
            Orders management
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
            Search orders instantly, paginate through the backlog, and drill into full order details.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
          Admin controls update the real backend order status.
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 backdrop-blur-xl">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className={`${panelClass} p-5`}>
          <p className="text-sm text-gray-300">Total Orders</p>
          <p className="mt-3 text-4xl font-extrabold text-white">
            {loading ? "..." : summary.total}
          </p>
        </div>
        <div className={`${panelClass} p-5`}>
          <p className="text-sm text-gray-300">Delivered</p>
          <p className="mt-3 text-4xl font-extrabold text-emerald-200">
            {loading ? "..." : summary.delivered}
          </p>
        </div>
        <div className={`${panelClass} p-5`}>
          <p className="text-sm text-gray-300">Pending</p>
          <p className="mt-3 text-4xl font-extrabold text-yellow-200">
            {loading ? "..." : summary.pending}
          </p>
        </div>
      </div>

      <div className={`${panelClass} p-5`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-200">
              Search Orders
            </p>
            <p className="mt-2 text-sm text-gray-300">
              Filter by customer name, email, order ID, or status.
            </p>
          </div>

          <div className="w-full max-w-xl">
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search orders..."
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className={`${panelClass} overflow-hidden`}>
          <div className="space-y-3 p-6">
            <div className="h-10 w-48 animate-pulse rounded-xl bg-white/10" />
            <div className="h-16 w-full animate-pulse rounded-2xl bg-white/10" />
            <div className="h-16 w-full animate-pulse rounded-2xl bg-white/10" />
            <div className="h-16 w-full animate-pulse rounded-2xl bg-white/10" />
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className={`${panelClass} p-10 text-center`}>
          <h2 className="text-2xl font-bold text-white">
            {orders.length === 0 ? "No orders found" : "No matching orders"}
          </h2>
          <p className="mt-3 text-sm text-gray-300">
            {orders.length === 0
              ? "Orders will appear here as soon as customers start checking out."
              : "Try a different search term to broaden the results."}
          </p>
        </div>
      ) : (
        <div className={`${panelClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm text-white">
              <thead className="bg-black/20 text-xs uppercase tracking-[0.24em] text-gray-300">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Placed</th>
                  <th className="px-6 py-4">Total Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {paginatedOrders.map((order) => {
                  const status = order.status || order.orderStatus || "Pending";
                  const isCancelled = status === "Cancelled";

                  return (
                    <tr key={order._id} className="bg-white/[0.03]">
                      <td className="px-6 py-4 align-top">
                        <div>
                          <p className="font-semibold text-white">
                            {order.user?.name || "Unknown User"}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {order.user?.email || "No email available"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-gray-300">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 align-top font-medium text-pink-200">
                        {formatCurrency(order.totalPrice)}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                            statusStyles[status] || statusStyles.Pending
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => navigate(`/orders/${order._id}`)}
                            className={secondaryButtonClass}
                          >
                            View Details
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(order._id, "Delivered")}
                            disabled={
                              isCancelled ||
                              status === "Delivered" ||
                              actionKey === `${order._id}-Delivered`
                            }
                            className={primaryButtonClass}
                          >
                            {actionKey === `${order._id}-Delivered`
                              ? "Updating..."
                              : "Mark Delivered"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(order._id, "Pending")}
                            disabled={
                              isCancelled ||
                              status === "Pending" ||
                              actionKey === `${order._id}-Pending`
                            }
                            className={secondaryButtonClass}
                          >
                            {actionKey === `${order._id}-Pending`
                              ? "Updating..."
                              : "Mark Pending"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-4 border-t border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-300">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{" "}
              {filteredOrders.length} orders
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className={secondaryButtonClass}
              >
                Previous
              </button>
              <div className="flex items-center rounded-xl border border-white/10 bg-black/10 px-4 py-2 text-sm text-white">
                Page {currentPage} of {totalPages}
              </div>
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className={secondaryButtonClass}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
