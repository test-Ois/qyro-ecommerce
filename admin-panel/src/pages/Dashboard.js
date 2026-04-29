import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import API from "../services/api";

const panelClass =
  "rounded-[28px] border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl";

const statCards = [
  {
    key: "users",
    label: "Total Users",
    accent: "from-pink-500/20 to-indigo-500/20"
  },
  {
    key: "orders",
    label: "Total Orders",
    accent: "from-indigo-500/20 to-cyan-500/20"
  },
  {
    key: "products",
    label: "Total Products",
    accent: "from-yellow-400/20 to-pink-500/20"
  },
  {
    key: "totalRevenue",
    label: "Total Revenue",
    accent: "from-emerald-400/20 to-teal-500/20"
  }
];

const quickLinks = [
  {
    title: "Manage Products",
    description: "Create, edit, and remove products from the catalog.",
    to: "/products"
  },
  {
    title: "Track Orders",
    description: "Review recent purchases and update fulfilment status.",
    to: "/orders"
  },
  {
    title: "Manage Users",
    description: "Review platform accounts and control user access.",
    to: "/users"
  },
  {
    title: "Review Sellers",
    description: "Approve pending sellers and keep marketplace quality high.",
    to: "/sellers"
  }
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(value) || 0);

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });

function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-white/20 bg-[#140f2d]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="text-xs uppercase tracking-[0.22em] text-pink-200">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white">
        {formatter(payload[0].value)}
      </p>
    </div>
  );
}

function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    orders: 0,
    products: 0,
    totalRevenue: 0,
    recentOrders: [],
    revenueSeries: [],
    orderSeries: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await API.get("/admin/stats");
        setStats({
          users: data.users || 0,
          orders: data.orders || 0,
          products: data.products || 0,
          totalRevenue: data.totalRevenue || 0,
          recentOrders: Array.isArray(data.recentOrders) ? data.recentOrders : [],
          revenueSeries: Array.isArray(data.revenueSeries) ? data.revenueSeries : [],
          orderSeries: Array.isArray(data.orderSeries) ? data.orderSeries : []
        });
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            "Something went wrong while loading dashboard stats."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    window.location.replace("http://localhost:3000/login");
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-pink-300">
            Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-white sm:text-4xl">
            Admin control center
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-300 sm:text-base">
            See platform growth, revenue movement, and the latest orders from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:shadow-lg"
        >
          Logout
        </button>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 backdrop-blur-xl">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.key}
            className={`rounded-2xl border border-white/20 bg-gradient-to-br ${card.accent} p-5 shadow-xl backdrop-blur-xl`}
          >
            <p className="text-sm text-gray-200">{card.label}</p>
            {loading ? (
              <div className="mt-4 h-9 w-28 animate-pulse rounded-xl bg-white/10" />
            ) : (
              <p className="mt-4 text-3xl font-extrabold text-white">
                {card.key === "totalRevenue"
                  ? formatCurrency(stats.totalRevenue)
                  : stats[card.key]}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className={`${panelClass} p-6`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-pink-200">
                Revenue Chart
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">Last 7 days revenue</h2>
            </div>
            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
              Live API
            </div>
          </div>

          <div className="mt-6 h-72">
            {loading ? (
              <div className="h-full animate-pulse rounded-3xl bg-white/10" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.revenueSeries}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="label" stroke="#cbd5e1" tickLine={false} axisLine={false} />
                  <YAxis
                    stroke="#cbd5e1"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${Math.round((Number(value) || 0) / 1000)}k`}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip formatter={(value) => formatCurrency(value)} />
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f472b6"
                    strokeWidth={3}
                    fill="url(#revenueFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className={`${panelClass} p-6`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-indigo-200">
                Orders Chart
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">Order volume trend</h2>
            </div>
            <div className="rounded-2xl border border-indigo-400/20 bg-indigo-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">
              Daily
            </div>
          </div>

          <div className="mt-6 h-72">
            {loading ? (
              <div className="h-full animate-pulse rounded-3xl bg-white/10" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.orderSeries}>
                  <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                  <XAxis dataKey="label" stroke="#cbd5e1" tickLine={false} axisLine={false} />
                  <YAxis stroke="#cbd5e1" tickLine={false} axisLine={false} />
                  <Tooltip
                    content={
                      <ChartTooltip formatter={(value) => `${value} orders`} />
                    }
                  />
                  <Bar dataKey="orders" fill="#818cf8" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.2fr,0.8fr]">
        <div className={`${panelClass} p-6`}>
          <div className="flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-indigo-200">
                Recent Orders
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">Latest purchases</h2>
            </div>
            <Link
              to="/orders"
              className="inline-flex items-center justify-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:bg-white/15"
            >
              View all orders
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {loading ? (
              <>
                <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
                <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
                <div className="h-24 animate-pulse rounded-2xl bg-white/10" />
              </>
            ) : stats.recentOrders.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-black/10 p-6 text-center">
                <p className="text-lg font-semibold text-white">No recent orders</p>
                <p className="mt-2 text-sm text-gray-300">
                  Orders will appear here as soon as customers start checking out.
                </p>
              </div>
            ) : (
              stats.recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/10 p-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-pink-200">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </p>
                    <p className="mt-2 text-lg font-bold text-white">
                      {order.user?.name || "Unknown User"}
                    </p>
                    <p className="mt-1 text-sm text-gray-400">
                      {order.user?.email || "No email available"}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-400">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="text-left sm:text-right">
                      <p className="text-lg font-bold text-emerald-200">
                        {formatCurrency(order.totalPrice)}
                      </p>
                      <span className="mt-1 inline-flex rounded-full border border-indigo-400/20 bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-100">
                        {order.status}
                      </span>
                    </div>

                    <Link
                      to={`/orders/${order._id}`}
                      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white transition duration-300 hover:scale-[1.02] hover:shadow-lg"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`${panelClass} p-6`}>
          <div className="border-b border-white/10 pb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-pink-200">
              Quick Actions
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">Jump into management</h2>
            <p className="mt-3 text-sm leading-6 text-gray-300">
              Move directly into the workflows your admin team uses the most.
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            {quickLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="group rounded-2xl border border-white/10 bg-black/10 p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sm font-bold text-pink-200">
                  {item.title.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-300">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
