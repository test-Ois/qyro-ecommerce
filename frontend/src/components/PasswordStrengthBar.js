function PasswordStrengthBar({ strength }) {

  // Width based on password strength level
  const getWidth = () => {
    if (strength === "Weak") return "w-1/3";
    if (strength === "Medium") return "w-2/3";
    if (strength === "Strong") return "w-full";
    return "w-0";
  };

  // Color based on password strength level
  const getColor = () => {
    if (strength === "Weak") return "bg-red-500";
    if (strength === "Medium") return "bg-orange-400";
    if (strength === "Strong") return "bg-green-500";
    return "bg-transparent";
  };

  return (
    <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${getWidth()} ${getColor()}`}
      />
    </div>
  );
}

export default PasswordStrengthBar;