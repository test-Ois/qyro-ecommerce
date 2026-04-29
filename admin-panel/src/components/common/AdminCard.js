function AdminCard({ children, className = "" }) {
  return (
    <div className={`rounded-[28px] border border-white/20 bg-white/10 shadow-xl backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

export default AdminCard;
