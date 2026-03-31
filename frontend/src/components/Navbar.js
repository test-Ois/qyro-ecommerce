import { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";

function Navbar({ openCart, notifications, setNotifications }) {

  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const sort = searchParams.get("sort") || "";
  const category = searchParams.get("category") || "";
  const priceRange = Number(searchParams.get("price")) || 1000000;

  const [showNotifications, setShowNotifications] = useState(false);
  const [showDepartments, setShowDepartments] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showLanguages, setShowLanguages] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const filterBtnRef = useRef(null);
  const filterMenuRef = useRef(null);
  const [filterPos, setFilterPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (showFilters && filterBtnRef.current) {
      const rect = filterBtnRef.current.getBoundingClientRect();
      setFilterPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX
      });
    }
  }, [showFilters]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        filterBtnRef.current &&
        !filterBtnRef.current.contains(e.target) &&
        filterMenuRef.current &&
        !filterMenuRef.current.contains(e.target)
      ) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateParam = (key, value) => {
    const params = Object.fromEntries(searchParams.entries());
    if (value) params[key] = value;
    else delete params[key];
    setSearchParams(params);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const clearNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  const languages = [
    { code: "en", name: "English (India)" },
    { code: "ln", name: "More languages coming soon" },
    
    
  ];

  return (
    <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">


      {/* ===== TOP NAVBAR ===== */}
  <div className="px-6 h-16 flex items-center gap-4">

        {/* LOGO */}
      
<div
  onClick={() => navigate("/")}
  className="cursor-pointer group relative flex items-center"
  style={{ userSelect: "none" }}
>
  <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/0 via-pink-500/0 to-purple-500/0 group-hover:from-yellow-400/10 group-hover:via-pink-500/10 group-hover:to-purple-500/10 blur-xl transition-all duration-500" />

  {/* Q */}
  <span
    style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: "32px",
      fontWeight: 900,
      background: "linear-gradient(90deg, #facc15, #ec4899)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      lineHeight: 1,
    }}
    className="group-hover:[filter:drop-shadow(0_0_12px_rgba(250,204,21,0.7))] transition-all duration-300"
  >
    Q
  </span>

  <span
    style={{
      fontFamily: "'Dancing Script', cursive",
      fontSize: "32px",
      fontWeight: 700,
      background: "linear-gradient(90deg, #ec4899 0%, #a855f7 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      letterSpacing: "3px",
      display: "inline-block",
      verticalAlign: "middle",
      marginLeft: "1px",
    }}
    className="group-hover:[filter:drop-shadow(0_0_12px_rgba(236,72,153,0.6))] group-hover:tracking-[3px] transition-all duration-300"
  >
    yro
  </span>

  {/* Underline */}
  <div className="absolute -bottom-1 left-0 h-[2px] w-0 group-hover:w-full bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-full transition-all duration-300" />
</div>
  
        {/* SEARCH BAR */}
        <div className="flex flex-1 h-10 bg-white/5 border border-white/10 rounded-full overflow-hidden max-w-xl mx-auto backdrop-blur-md">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => updateParam("search", e.target.value)}
            className="flex-1 px-5 bg-transparent text-sm outline-none text-white placeholder-gray-400"
          />
          <button 
  type="button"
  className="w-12 flex items-center justify-center flex-shrink-0
  bg-yellow-400/10 backdrop-blur-md
  hover:bg-yellow-400/20
  border-l border-white/10
  transition-all duration-300
  group"
>

  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className="w-5 h-5 text-gray-400 
               group-hover:text-yellow-400 
               group-hover:scale-110 
               transition duration-200"
  >
    <path 
      fillRule="evenodd" 
      d="M10.5 3.75a6.75 6.75 0 1 0 0 13.5 6.75 6.75 0 0 0 0-13.5ZM2.25 10.5a8.25 8.25 0 1 1 14.59 5.28l4.69 4.69a.75.75 0 1 1-1.06 1.06l-4.69-4.69A8.25 8.25 0 0 1 2.25 10.5Z" 
      clipRule="evenodd" 
    />
  </svg>

</button>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {!user ? (
            <button
              onClick={() => navigate("/login")}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-semibold px-5 py-2 rounded-full hover:scale-105 transition"
            >
              Sign in
            </button>
          ) : (
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-white/10 transition">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-white hidden md:block">
                  {user.name.split(" ")[0]}
                </span>
              </button>

              <div className="hidden group-hover:block absolute top-12 right-0 bg-[#1a1035] border border-white/10 backdrop-blur-lg rounded-2xl min-w-48 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-white/10 text-white">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email || user.role}</p>
                </div>

                {[
  { label: "Account Settings", path: "/account" },
  { label: "My Orders", path: "/orders" },

  {
    label: (
      <div className="flex items-center gap-2">
        <span>Wishlist</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-5 h-5 text-yellow-400"
        >
          <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
        </svg>
      </div>
    ),
    path: "/wishlist"
  },

  ...(user?.role === "seller"
    ? [
        {
          label: (
            <div className="flex items-center gap-2">
              <span>Add Product</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 text-yellow-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
          ),
          path: "/add-product"
        }
      ]
    : []),
].map((item) => (
  <button
    key={item.path}
    onClick={() => navigate(item.path)}
    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 border-b border-white/10"
  >
    {item.label}
  </button>
))}

                {user.role === "seller" && (
  <button
    onClick={() => navigate("/seller-dashboard")}
    className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-white/10 border-b border-white/10"
  >
    <div className="flex items-center gap-2">
      <span>Seller Dashboard</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5 text-yellow-400"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 21h16.5M4.5 3h15v13.5h-15V3Zm3 4.5h3m-3 3h6m-6 3h4"
        />
      </svg>
    </div>
  </button>
)}

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-white/10 font-medium"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}

          {/* 🔔 */}
          <div className="relative">
            <button
  onClick={() => setShowNotifications(!showNotifications)}
  className="relative w-10 h-10 flex items-center justify-center rounded-full 
             hover:bg-yellow-400/10 transition duration-300 
             hover:shadow-[0_0_12px_rgba(250,204,21,0.6)] group"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 
               group-hover:scale-110 transition duration-200"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"
    />
  </svg>

  {notifications.length > 0 && (
    <span className="absolute top-1 right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></span>
  )}
</button>

            {showNotifications && (
              <div className="absolute top-12 right-0 bg-[#1a1035] border border-white/10 rounded-2xl w-72 z-50 overflow-hidden text-white">
                <div className="flex justify-between items-center px-4 py-3 border-b border-white/10">
                  <strong className="text-sm font-semibold">Notifications</strong>
                  {notifications.length > 0 && (
                    <span
                      onClick={clearNotifications}
                      className="text-xs text-purple-400 cursor-pointer"
                    >
                      Clear all
                    </span>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-gray-400 text-center">
                    No notifications
                  </p>
                ) : (
                  notifications.map((n, index) => (
                    <div key={index} className="px-4 py-3 border-b border-white/10 text-sm">
                      <p>{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* 🛒 */}
          <button
  onClick={() => navigate("/cart")}
  className="relative w-10 h-10 flex items-center justify-center rounded-full 
             hover:bg-yellow-400/10 transition duration-300 
             hover:shadow-[0_0_12px_rgba(250,204,21,0.6)] group"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-5 h-5 text-gray-400 group-hover:text-yellow-400 
               group-hover:scale-110 transition duration-200"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
    />
  </svg>

  {totalItems > 0 && (
    <span className="absolute top-1 right-1 w-4 h-4 bg-yellow-400 text-black text-xs rounded-full flex items-center justify-center animate-pulse">
      {totalItems}
    </span>
  )}
</button>
          


          {/* ☰ */}
          <button
            onClick={() => setShowDepartments(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition"
          >
            <span className="text-xl">☰</span>
          </button>

        </div>
      </div>

      {/* ===== BOTTOM NAV ===== */}
      <div className="bg-[#0f0a1e] border-b border-white/10 px-6 h-10 flex items-center gap-1 overflow-x-auto">

        {[
          { label: "New Arrivals", path: "/" },
          { label: "Customer Service", path: "/customer-service" },
          { label: "Best Sellers", path: "/" },
        ].map((item) => (
          <button
  key={item.label}
  onClick={() => navigate(item.path)}
  className={`flex items-center gap-1 px-3 py-1 text-xs font-medium whitespace-nowrap rounded-full
  transition-all duration-300 group
  text-gray-300 hover:bg-yellow-400/10`}
>

  {/* TEXT */}
  <span className="group-hover:text-yellow-400 transition">
    {item.label}
  </span>

  {/* ICON AFTER TEXT */}
  {item.label === "Customer Service" && (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-4 h-4 text-gray-400 group-hover:text-yellow-400 group-hover:scale-110 transition"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.5 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
      />
    </svg>
  )}

</button>
        ))}

        <div className="h-4 w-px bg-white/10 mx-1" />

        <button
  ref={filterBtnRef}
  onClick={() => setShowFilters(!showFilters)}
  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium
  transition-all duration-300 group
  ${
    showFilters
      ? "bg-yellow-400 text-black shadow-[0_0_12px_rgba(250,204,21,0.6)]"
      : "text-gray-300 hover:bg-yellow-400/10"
  }`}
>

  {/* TEXT */}
  <span className="tracking-wide">Filters</span>

  {/* NEW ICON (▼) */}
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={`w-4 h-4 transition duration-200
      ${
        showFilters
          ? "text-black rotate-180"
          : "text-gray-400 group-hover:text-yellow-400"
      }`}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m19.5 8.25-7.5 7.5-7.5-7.5"
    />
  </svg>

</button>

        {/* <select
          value={sort}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="bg-transparent text-xs text-gray-300 outline-none px-2"
        >
          <option value="">Sort</option>
          <option value="low">Low → High</option>
          <option value="high">High → Low</option>
        </select> */}

      </div>

      {/* FILTER */}
      {showFilters && (
        <div
          ref={filterMenuRef}
          style={{ top: filterPos.top, left: filterPos.left }}
          className="fixed bg-[#1a1035] border border-white/10 rounded-2xl p-4 w-56 z-50 text-white"
        >
          <p className="text-xs mb-2 text-gray-400">Category</p>

          {["", "electronics", "clothing", "shoes", "books", "sports"].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                updateParam("category", cat);
                setShowFilters(false);
              }}
              className="w-full text-left px-3 py-2 rounded-xl text-sm mb-1 hover:bg-white/10"
            >
              {cat || "All Categories"}
            </button>
          ))}

          <p className="text-xs mt-3 mb-2 text-gray-400">
            Max Price: ₹{priceRange.toLocaleString()}
          </p>

          <input
            type="range"
            min="500"
            max="1000000"
            value={priceRange}
            onChange={(e) => updateParam("price", e.target.value)}
            className="w-full accent-purple-500"
          />
        </div>
      )}

      {/* SIDEBAR */}
      {/* ===== SIDEBAR ===== */}
{showDepartments && (
  <div
    className="fixed inset-0 bg-black/50 z-50"
    onClick={() => setShowDepartments(false)}
  >
    <div
      className="absolute right-0 top-0 w-72 h-full bg-[#0f0a1e] shadow-2xl overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >

      {/* Sidebar header */}
      <div className="bg-[#1a1035] px-5 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user ? user.name?.[0]?.toUpperCase() : "👤"}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">
              {user ? `Hello, ${user.name}` : "Hello, sign in"}
            </p>
            {user && (
              <p className="text-xs text-gray-400 capitalize">{user.role}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowDepartments(false)}
          className="text-gray-400 hover:text-white text-lg"
        >
          ✖
        </button>
      </div>

      {/* Programs & Features */}
      <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase border-b border-white/10">
        Programs & Features
      </div>

      {[
  { label: "New Arrivals", path: "/" },
  { label: "Wishlist", path: "/wishlist" },
  { label: "My Orders", path: "/orders" },
  ...(user?.role === "seller"
    ? [
        { label: "Add Product", path: "/add-product" },
        { label: "Seller Dashboard", path: "/seller-dashboard" }
      ]
    : []),
].map((item) => (
        <button
          key={item.path}
          onClick={() => { setShowDepartments(false); navigate(item.path); }}
          className="w-full px-5 py-3 text-left text-sm text-white hover:bg-white/10 border-b border-white/10 flex justify-between items-center transition"
        >
          {item.label} <span className="text-gray-500">›</span>
        </button>
      ))}

      {/* Help & Settings */}
      <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase border-b border-white/10">
        Help & Settings
      </div>

      <button
        onClick={() => { setShowDepartments(false); navigate(user ? "/account" : "/login"); }}
        className="w-full px-5 py-3 text-left text-sm text-white hover:bg-white/10 border-b border-white/10 flex justify-between items-center"
      >
        Account Settings <span className="text-gray-500">›</span>
      </button>

      <button
        onClick={() => { setShowDepartments(false); navigate("/customer-service"); }}
        className="w-full px-5 py-3 text-left text-sm text-white hover:bg-white/10 border-b border-white/10 flex justify-between items-center"
      >
        Customer Service <span className="text-gray-500">›</span>
      </button>

      {/* Language selector */}
      <button
        onClick={() => setShowLanguages(!showLanguages)}
        className="w-full px-5 py-3 text-left text-sm text-white hover:bg-white/10 border-b border-white/10 flex justify-between items-center"
      >
        <span>🌐 {selectedLanguage}</span>
        <span className="text-gray-500">{showLanguages ? "^" : "›"}</span>
      </button>

      {showLanguages && (
        <div className="bg-[#1a1035]">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setSelectedLanguage(lang.name.split(" ")[0]);
                setShowLanguages(false);
              }}
              className={`w-full px-6 py-2.5 text-left text-sm border-b border-white/10 flex items-center gap-2 ${
                selectedLanguage === lang.name.split(" ")[0]
                  ? "text-purple-400 font-semibold"
                  : "text-gray-300 hover:bg-white/10"
              }`}
            >
              <span>{selectedLanguage === lang.name.split(" ")[0] ? "✓" : ""}</span>
              {lang.name}
            </button>
          ))}
        </div>
      )}

      {/* Sign in / Sign out */}
      {!user ? (
        <button
          onClick={() => { setShowDepartments(false); navigate("/login"); }}
          className="w-full px-5 py-3 text-left text-sm font-semibold text-yellow-400 hover:bg-white/10 border-b border-white/10"
        >
          Sign in ›
        </button>
      ) : (
        <button
          onClick={() => { setShowDepartments(false); handleLogout(); }}
          className="w-full px-5 py-3 text-left text-sm font-semibold text-red-400 hover:bg-white/10 border-b border-white/10"
        >
          Sign out
        </button>
      )}

    </div>
  </div>
)}
      

    </div>
  );
}

export default Navbar;