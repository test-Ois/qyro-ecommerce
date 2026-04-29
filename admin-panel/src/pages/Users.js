import { useEffect, useMemo, useState } from "react";
import AdminButton from "../components/common/AdminButton";
import { adminApi, getAdminApiErrorMessage } from "../services/api";

const panelClass =
  "rounded-[28px] border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionKey, setActionKey] = useState("");

  const currentUserId = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}").id || "";
    } catch (requestError) {
      return "";
    }
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (requestError) {
      setError(getAdminApiErrorMessage(requestError, "Something went wrong while loading users."));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const summary = useMemo(
    () => ({
      total: users.length,
      admins: users.filter((user) => user.role === "admin").length,
      blocked: users.filter((user) => user.isBlocked).length
    }),
    [users]
  );

  const handleDelete = async (userId) => {
    setActionKey(`delete-${userId}`);
    setError("");

    try {
      await adminApi.deleteUser(userId);
      setUsers((currentUsers) => currentUsers.filter((user) => user._id !== userId));
    } catch (requestError) {
      setError(getAdminApiErrorMessage(requestError, "Something went wrong while deleting the user."));
    } finally {
      setActionKey("");
    }
  };

  const handleBlockToggle = async (userId) => {
    setActionKey(`block-${userId}`);
    setError("");

    try {
      const updatedUser = await adminApi.toggleUserBlock(userId);
      setUsers((currentUsers) =>
        currentUsers.map((user) => (user._id === userId ? updatedUser : user))
      );
    } catch (requestError) {
      setError(getAdminApiErrorMessage(requestError, "Something went wrong while updating the user."));
    } finally {
      setActionKey("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-pink-300">
            Users
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
            Users management
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300">
            Review platform accounts, remove unwanted users, and block access when needed.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
          Blocking a user immediately invalidates their refresh session.
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 backdrop-blur-xl">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <div className={`${panelClass} p-5`}>
          <p className="text-sm text-gray-300">Total Users</p>
          <p className="mt-3 text-4xl font-extrabold text-white">{loading ? "..." : summary.total}</p>
        </div>
        <div className={`${panelClass} p-5`}>
          <p className="text-sm text-gray-300">Admins</p>
          <p className="mt-3 text-4xl font-extrabold text-indigo-100">{loading ? "..." : summary.admins}</p>
        </div>
        <div className={`${panelClass} p-5`}>
          <p className="text-sm text-gray-300">Blocked</p>
          <p className="mt-3 text-4xl font-extrabold text-red-200">{loading ? "..." : summary.blocked}</p>
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
      ) : users.length === 0 ? (
        <div className={`${panelClass} p-10 text-center`}>
          <h2 className="text-2xl font-bold text-white">No users found</h2>
          <p className="mt-3 text-sm text-gray-300">
            User accounts will appear here automatically as they register.
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
                  <th className="px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map((user) => {
                  const isCurrentUser = user._id === currentUserId;
                  const blockKey = `block-${user._id}`;
                  const deleteKey = `delete-${user._id}`;

                  return (
                    <tr key={user._id} className="bg-white/[0.03]">
                      <td className="px-6 py-4 align-top">
                        <div>
                          <p className="font-semibold text-white">{user.name}</p>
                          <p className="mt-1 text-xs text-gray-400">
                            {isCurrentUser ? "Current admin session" : user.isBlocked ? "Blocked user" : "Active account"}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-gray-200">{user.email}</td>
                      <td className="px-6 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                            user.role === "admin"
                              ? "border-indigo-400/20 bg-indigo-500/15 text-indigo-100"
                              : user.role === "seller"
                                ? "border-pink-400/20 bg-pink-500/15 text-pink-100"
                                : "border-white/15 bg-white/10 text-gray-100"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-wrap gap-3">
                          <AdminButton
                            onClick={() => handleBlockToggle(user._id)}
                            disabled={isCurrentUser || actionKey === blockKey}
                          >
                            {actionKey === blockKey
                              ? "Updating..."
                              : user.isBlocked
                                ? "Unblock User"
                                : "Block User"}
                          </AdminButton>
                          <AdminButton
                            variant="danger"
                            onClick={() => handleDelete(user._id)}
                            disabled={isCurrentUser || actionKey === deleteKey}
                          >
                            {actionKey === deleteKey ? "Deleting..." : "Delete User"}
                          </AdminButton>
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

export default Users;
