function AdminInput({ className = "", ...inputProps }) {
  return (
    <input
      className={`w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-gray-300 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 ${className}`}
      {...inputProps}
    />
  );
}

export default AdminInput;
