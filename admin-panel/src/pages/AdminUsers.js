import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { TableSkeleton, Skeleton } from "../components/common/TableSkeleton";

const panelClass =
  "rounded-[28px] border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl";
const primaryButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:from-white/10 disabled:to-white/10 disabled:text-gray-400 disabled:hover:scale-100";
const dangerButtonClass =
  "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-red-500 to-rose-600 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50";
const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50";

function AdminUsers() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionKey, setActionKey] = useState("");
  const [tab, setTab] = useState("pending"); // "pending" | "all"

  const fetchAdmins = async () => {
    setLoading(true);
    setError("");
    try {
      const endpoint = tab === "pending" ? "/admin/pending-admins" : "/admin/admins";
      const { data } = await API.get(endpoint);
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin accounts.");
      setAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line
  }, [tab]);

  const summary = useMemo(
    () => ({
      total: admins.length,
      approved: admins.filter((a) => a.isApproved).length,
      pending: admins.filter((a) => !a.isApproved).length
    }),
    [admins]
  );

  const handleAction = async (adminId, action) => {
    setActionKey(`${adminId}-${action}`);
    setError("");
    try {
      await API.put(`/admin/admins/${adminId}/${action}`);
      await fetchAdmins();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} admin.`);
    } finally {
      setActionKey("");
    }
  };

  const actionLabel = (key, adminId, action) =>
    actionKey === `${adminId}-${action}` ? "Processing..." : capitalize(action);

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet-300">
            Super Admin
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
            Admin Management
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
            Approve, reject, block, promote or demote admin accounts. Only super admins can access this panel.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("pending")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            tab === "pending"
              ? "bg-violet-600 text-white"
              : "border border-white/20 bg-white/5 text-gray-300 hover:bg-white/10"
          }`}
        >
          Pending Approval
        </button>
        <button
          onClick={() => setTab("all")}
          className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
            tab === "all"
              ? "bg-violet-600 text-white"
              : "border border-white/20 bg-white/5 text-gray-300 hover:bg-white/10"
          }`}
        >
          All Admins
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 backdrop-blur-xl">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Total", value: summary.total, color: "text-white" },
          { label: "Approved", value: summary.approved, color: "text-emerald-200" },
          { label: "Pending", value: summary.pending, color: "text-yellow-200" }
        ].map(({ label, value, color }) => (
          <div key={label} className={`${panelClass} p-5`}>
            <p className="text-sm text-gray-300">{label}</p>
            {loading ? (
              <Skeleton className="mt-3 h-10 w-20 bg-white/10 animate-pulse" />
            ) : (
              <p className={`mt-3 text-4xl font-extrabold ${color}`}>{value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={4} cols={5} />
      ) : admins.length === 0 ? (
        <div className={`${panelClass} p-10 text-center`}>
          <h2 className="text-2xl font-bold text-white">
            {tab === "pending" ? "No pending admin requests" : "No admins found"}
          </h2>
          <p className="mt-3 text-sm text-gray-300">
            {tab === "pending"
              ? "All admin accounts are approved."
              : "No admin accounts exist yet."}
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
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {admins.map((a) => (
                  <tr key={a._id} className="bg-white/[0.03]">
                    <td className="px-6 py-4 font-semibold text-white">{a.name}</td>
                    <td className="px-6 py-4 text-gray-200">{a.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold
                        ${a.role === "super_admin"
                          ? "border-violet-400/20 bg-violet-500/15 text-violet-200"
                          : "border-blue-400/20 bg-blue-500/15 text-blue-200"}`}>
                        {a.role === "super_admin" ? "Super Admin" : "Admin"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold
                        ${a.isApproved
                          ? "border-emerald-400/20 bg-emerald-500/15 text-emerald-200"
                          : a.approvalStatus === "rejected"
                            ? "border-red-400/20 bg-red-500/15 text-red-200"
                            : "border-yellow-400/20 bg-yellow-500/15 text-yellow-200"}`}>
                        {a.isApproved ? "Approved" : a.approvalStatus === "rejected" ? "Rejected" : "Pending"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {!a.isApproved && a.approvalStatus !== "rejected" && (
                          <button
                            onClick={() => handleAction(a._id, "approve")}
                            disabled={!!actionKey}
                            className={primaryButtonClass}
                          >
                            {actionLabel(actionKey, a._id, "approve")}
                          </button>
                        )}
                        {!a.isApproved && a.approvalStatus !== "rejected" && (
                          <button
                            onClick={() => handleAction(a._id, "reject")}
                            disabled={!!actionKey}
                            className={secondaryButtonClass}
                          >
                            {actionLabel(actionKey, a._id, "reject")}
                          </button>
                        )}
                        {a.role === "admin" && a.isApproved && (
                          <button
                            onClick={() => handleAction(a._id, "promote")}
                            disabled={!!actionKey}
                            className={primaryButtonClass}
                          >
                            Promote
                          </button>
                        )}
                        {a.role === "super_admin" && (
                          <button
                            onClick={() => handleAction(a._id, "demote")}
                            disabled={!!actionKey}
                            className={secondaryButtonClass}
                          >
                            Demote
                          </button>
                        )}
                        {a.isBlocked ? (
                          <button
                            onClick={() => handleAction(a._id, "unblock")}
                            disabled={!!actionKey}
                            className={primaryButtonClass}
                          >
                            {actionLabel(actionKey, a._id, "unblock")}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(a._id, "block")}
                            disabled={!!actionKey}
                            className={dangerButtonClass}
                          >
                            {actionLabel(actionKey, a._id, "block")}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
