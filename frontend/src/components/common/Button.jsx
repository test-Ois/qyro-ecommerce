export default function Button({ children, onClick, className = "", disabled = false, type = "button" }) {
  return (
    <button type={type} onClick={onClick} className={className} disabled={disabled}>
      {children}
    </button>
  );
}
