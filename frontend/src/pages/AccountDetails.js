import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function AccountDetails() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
  document.title = "Qyro - Explore Your Account";
}, []);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const memberSince =
    user?.createdAt && !Number.isNaN(new Date(user.createdAt).getTime())
      ? new Date(user.createdAt).toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric"
        })
      : "Qyro Member";

  const roleStyles = {
    admin: "bg-yellow-400/15 text-yellow-300 border border-yellow-400/20",
    seller: "bg-blue-400/15 text-blue-300 border border-blue-400/20",
    user: "bg-emerald-400/15 text-emerald-300 border border-emerald-400/20"
  };

  return (
    <div className="min-h-screen bg-[#070014] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#120422] shadow-[0_20px_70px_rgba(0,0,0,0.35)]">
          <div className="border-b border-white/10 bg-gradient-to-r from-[#1a0833] via-[#18052f] to-[#120422] px-5 py-6 sm:px-8 sm:py-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="sm:text-3xl text-purple-300">
                  My Account
                </p>
                {/* <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl">
                  Your Profile
                </h1> */}
                <p className="mt-2 text-sm text-gray-400">
                  Manage your account details and quick actions.
                </p>
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-yellow-400 text-xl font-bold text-white shadow-lg">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:p-8">
            <div className="rounded-[24px] border border-white/10 bg-[#16072c] p-5 sm:p-6">
              <div className="mb-5">
                <h2 className="text-xl font-bold text-white">Profile Information</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Your basic account details are shown below.
                </p>
              </div>

              <div className="space-y-4">
                <InfoRow label="Full Name" value={user.name || "Not available"} />
                <InfoRow label="Email" value={user.email || "Not available"} />

                <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Account Type
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                      roleStyles[user.role] || roleStyles.user
                    }`}
                  >
                    {user.role || "user"}
                  </span>
                </div>

                <InfoRow label="Qyro Member Since" value={memberSince} />
              </div>

              <div className="mt-6 rounded-2xl border border-purple-400/10 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4">
                <p className="text-sm text-purple-200">
                  Your account was created in{" "}
                  <span className="font-semibold text-white">{memberSince}</span>
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-[24px] border border-white/10 bg-[#16072c] p-5 sm:p-6">
                <div className="mb-5">
                  <h2 className="text-xl font-bold text-white">Quick Actions</h2>
                  <p className="mt-1 text-sm text-gray-400">
                    Jump quickly to important account sections.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <QuickCard
                    title="Your Orders"
                    subtitle="Track, manage and review your orders"
                    onClick={() => navigate("/orders")}
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
                        />
                      </svg>
                    }
                    iconClass="bg-purple-500/15 text-purple-300"
                  />

                  <QuickCard
                    title="Wishlist"
                    subtitle="View your saved favourite products"
                    onClick={() => navigate("/wishlist")}
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-6 w-6"
                      >
                        <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                      </svg>
                    }
                    iconClass="bg-pink-500/15 text-pink-300"
                  />

                  {user.role === "seller" && (
                    <QuickCard
                      title="Seller Dashboard"
                      subtitle="Manage your store and products"
                      onClick={() => navigate("/seller-dashboard")}
                      icon={
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-6 w-6"
                        >
                          <path d="M3 9.75A2.25 2.25 0 0 1 5.25 7.5h13.5A2.25 2.25 0 0 1 21 9.75v8.25A2.25 2.25 0 0 1 18.75 20.25H5.25A2.25 2.25 0 0 1 3 18V9.75Z" />
                          <path d="M7.5 3.75A2.25 2.25 0 0 0 5.25 6v1.5h13.5V6a2.25 2.25 0 0 0-2.25-2.25H7.5Z" />
                        </svg>
                      }
                      iconClass="bg-blue-500/15 text-blue-300"
                    />
                  )}

                  <QuickCard
                    title="Change Password"
                    subtitle="Update your password securely"
                    onClick={() => navigate("/forgot-password")}
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="h-6 w-6"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    }
                    iconClass="bg-yellow-400/15 text-yellow-300"
                  />
                </div>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-[#16072c] p-5 sm:p-6">
                <h2 className="text-lg font-bold text-white">Session</h2>
                <p className="mt-1 text-sm text-gray-400">
                  Sign out from your current account session.
                </p>

                <div className="mt-6 border-t border-white/10 pt-6">
                  <button
                    onClick={handleLogout}
                    className="w-full rounded-2xl bg-gradient-to-r from-red-500 to-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] hover:shadow-lg"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
        {label}
      </span>
      <span className="text-sm font-semibold text-white sm:text-base">
        {value}
      </span>
    </div>
  );
}

function QuickCard({ title, subtitle, onClick, icon, iconClass }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group rounded-[22px] border border-white/10 bg-white/[0.03] p-5 text-left transition hover:-translate-y-1 hover:border-purple-400/30 hover:bg-white/[0.05]"
    >
      <div
        className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}
      >
        {icon}
      </div>

      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-gray-400">{subtitle}</p>
    </button>
  );
}

export default AccountDetails;