export default function Badge({ children, type = "default" }) {
  const style = {
    default: "bg-gray-700 text-gray-100",
    success: "bg-green-500 text-white",
    info: "bg-blue-500 text-white"
  }[type] || "bg-gray-700 text-gray-100";

  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${style}`}>{children}</span>;
}
