import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Dashboard", short: "DB" },
  { to: "/products", label: "Products", short: "PR" },
  { to: "/orders", label: "Orders", short: "OR" },
  { to: "/users", label: "Users", short: "US" },
  { to: "/sellers", label: "Sellers", short: "SE" }
];

function Sidebar() {
  return (
    <aside className="w-full shrink-0 p-4 sm:p-6 lg:w-72 lg:pr-0 xl:w-80">
      <div className="h-full rounded-[28px] border border-white/10 bg-black/20 p-6 shadow-xl backdrop-blur-xl lg:sticky lg:top-6">
        <div className="border-b border-white/10 pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pink-300">
            Admin Panel
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-gradient-brand">
            Qyro
          </h1>
          <p className="mt-3 text-sm leading-6 text-gray-300">
            Manage products, orders, and sellers with the same glass UI as the storefront.
          </p>
        </div>

        <nav className="mt-6 space-y-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all duration-300 ${
                  isActive
                    ? "border-white/20 bg-gradient-to-r from-pink-500/30 to-indigo-500/30 text-white shadow-lg"
                    : "border-white/10 bg-white/5 text-gray-200 hover:border-white/20 hover:bg-white/10"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl text-xs font-bold tracking-[0.2em] ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-white/10 text-pink-200 group-hover:bg-white/15"
                    }`}
                  >
                    {item.short}
                  </span>

                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-gray-300">
                      {item.label === "Dashboard" && "Overview and quick actions"}
                      {item.label === "Products" && "Create and manage catalog"}
                      {item.label === "Orders" && "Track fulfilment status"}
                      {item.label === "Users" && "View and control accounts"}
                      {item.label === "Sellers" && "Approve pending sellers"}
                    </p>
                  </div>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
            Theme
          </p>
          <p className="mt-2 text-sm leading-6 text-gray-300">
            Gradient background, frosted cards, and neon accents now match the frontend design language.
          </p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
