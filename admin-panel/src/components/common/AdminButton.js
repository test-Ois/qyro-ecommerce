const variantClasses = {
  primary:
    "bg-gradient-to-r from-pink-500 to-indigo-500 text-white hover:scale-[1.02] hover:shadow-lg disabled:from-white/10 disabled:to-white/10 disabled:text-gray-400 disabled:hover:scale-100 disabled:hover:shadow-none",
  secondary:
    "border border-white/20 bg-white/10 text-white hover:bg-white/15 disabled:opacity-50",
  danger:
    "border border-red-400/30 bg-red-500/10 text-red-100 hover:bg-red-500/20 disabled:opacity-50"
};

function AdminButton({
  children,
  className = "",
  disabled = false,
  type = "button",
  variant = "primary",
  ...buttonProps
}) {
  const variantClass = variantClasses[variant] || variantClasses.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition duration-300 disabled:cursor-not-allowed ${variantClass} ${className}`}
      {...buttonProps}
    >
      {children}
    </button>
  );
}

export default AdminButton;
