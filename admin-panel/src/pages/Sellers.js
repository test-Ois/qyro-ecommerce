import { useEffect, useMemo, useState } from "react";
import API from "../services/api";

const panelClass =
  "rounded-[28px] border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl";
const primaryButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:from-white/10 disabled:to-white/10 disabled:text-gray-400 disabled:hover:scale-100 disabled:hover:shadow-none";
const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50";

function Sellers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionKey, setActionKey] = useState("");

  const fetchSellers = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await API.get("/admin/sellers");
      setSellers(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Something went wrong while loading sellers.");
      setSellers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const summary = useMemo(
    () => ({
      total: sellers.length,
      approved: sellers.filter((seller) => seller.isApproved).length,
      pending: sellers.filter((seller) => !seller.isApproved).length
    }),
    [sellers]
  );

  const handleSellerAction = async (sellerId, action) => {
    setActionKey(`${sellerId}-${action}`);
    setError("");

    try {
      await API.put(`/admin/sellers/${sellerId}/${action}`);

      await fetchSellers();
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || `Something went wrong while trying to ${action} the seller.`);
    } finally {
      setActionKey("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink-300">
            Sellers
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
            Sellers management
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
            Review seller applications, approve trusted stores, and keep marketplace access under control.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
          Approve or reject seller access directly from the admin panel.
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 backdrop-blur-xl">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className={`${panelClass} p-5`}>
          <p className="text-sm text-gray-300">Total Sellers</p>
          <p className="mt-3 text-4xl font-extrabold text-white">
            {loading ? "..." : summary.total}
          </p>
        </div>
        <div className={`${panelClass} p-5`}>
          <p className="text-sm text-gray-300">Approved</p>
          <p className="mt-3 text-4xl font-extrabold text-emerald-200">
            {loading ? "..." : summary.approved}
          </p>
        </div>
        <div className={`${panelClass} p-5`}>
          <p className="text-sm text-gray-300">Pending</p>
          <p className="mt-3 text-4xl font-extrabold text-yellow-200">
            {loading ? "..." : summary.pending}
          </p>
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
      ) : sellers.length === 0 ? (
        <div className={`${panelClass} p-10 text-center`}>
          <h2 className="text-2xl font-bold text-white">No sellers found</h2>
          <p className="mt-3 text-sm text-gray-300">
            Seller accounts will appear here as soon as applications are submitted.
          </p>
        </div>
      ) : (
        <div className={`${panelClass} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm text-white">
              <thead className="bg-black/20 text-xs uppercase tracking-[0.24em] text-gray-300">
                <tr>
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {sellers.map((seller) => {
                  const approveKey = `${seller._id}-approve`;
                  const rejectKey = `${seller._id}-reject`;

                  return (
                    <tr key={seller._id} className="bg-white/[0.03]">
                      <td className="px-6 py-4 align-top">
                        <div>
                          <p className="font-semibold text-white">{seller.name}</p>
                          <p className="mt-1 text-xs text-gray-400">
                            {seller.shopName || "Independent seller"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-gray-200">
                        {seller.email}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                            seller.isApproved
                              ? "border-emerald-400/20 bg-emerald-500/15 text-emerald-200"
                              : "border-yellow-400/20 bg-yellow-500/15 text-yellow-200"
                          }`}
                        >
                          {seller.isApproved ? "Approved" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            onClick={() => handleSellerAction(seller._id, "approve")}
                            disabled={seller.isApproved || actionKey === approveKey}
                            className={primaryButtonClass}
                          >
                            {actionKey === approveKey ? "Approving..." : "Approve"}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSellerAction(seller._id, "reject")}
                            disabled={actionKey === rejectKey}
                            className={secondaryButtonClass}
                          >
                            {actionKey === rejectKey ? "Rejecting..." : "Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sellers;
