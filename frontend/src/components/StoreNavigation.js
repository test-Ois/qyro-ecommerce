import { useContext } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Products", to: "/products" },
  { label: "Cart", to: "/cart" },
  { label: "Orders", to: "/orders", requiresAuth: true },
  { label: "Profile", to: "/profile", requiresAuth: true }
];

function StoreNavigation({ onNavigate }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const resolvePath = (item) => {
    if (!item.requiresAuth || user) {
      return item.to;
    }

    return "/login";
  };

  const isActiveRoute = (item) => {
    if (item.to === "/") {
      return location.pathname === "/" || location.pathname === "/home";
    }

    if (item.to === "/products") {
      return location.pathname === "/products" || location.pathname.startsWith("/product/");
    }

    if (item.to === "/profile") {
      return location.pathname === "/profile" || location.pathname === "/account";
    }

    return location.pathname === item.to;
  };

  return (
    <div className="h-full w-64 bg-[#0f0c29] p-4 text-white">
      <div className="flex h-full flex-col rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-yellow-300">
          Store Menu
        </p>
        <h2 className="mt-3 text-2xl font-extrabold text-white">Navigate</h2>
        <p className="mt-2 text-sm leading-6 text-gray-400">
          Jump between your main storefront pages from the hamburger menu.
        </p>

        <nav className="mt-6 space-y-3">
          {navItems.map((item) => {
            const isActive = isActiveRoute(item);

            return (
              <NavLink
                key={item.to}
                to={resolvePath(item)}
                onClick={onNavigate}
                className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "border-yellow-400/30 bg-gradient-to-r from-yellow-400/20 to-pink-500/20 text-white shadow-[0_0_18px_rgba(250,204,21,0.16)]"
                    : "border-white/10 bg-white/[0.03] text-gray-200 hover:border-white/20 hover:bg-white/[0.08]"
                }`}
              >
                <span>{item.label}</span>
                <span className={isActive ? "text-yellow-300" : "text-gray-500"}>{">"}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default StoreNavigation;
