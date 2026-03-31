import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PasswordStrengthBar from "../components/PasswordStrengthBar";

import {
  checkPasswordStrength,
  validatePassword
} from "../utils/passwordUtils";

function Register() {

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [strength, setStrength] = useState("");
  const [loading, setLoading] = useState(false);

  const [isSeller, setIsSeller] = useState(false);
  const [shopName, setShopName] = useState("");
  const [shopDescription, setShopDescription] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 3) {
      setError("Name must be at least 3 characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError("Email address is required");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address (e.g. example@gmail.com)");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (!validatePassword(password)) {
      setError("Password must contain uppercase, number and special character");
      return;
    }

    if (isSeller && !shopName.trim()) {
      setError("Shop name is required for seller registration");
      return;
    }

    setLoading(true);

    try {

      const res = await fetch(
        "http://localhost:5000/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            password,
            role: isSeller ? "seller" : "user",
            shopName: isSeller ? shopName : "",
            shopDescription: isSeller ? shopDescription : ""
          })
        }
      );

      const data = await res.json();

      if (res.ok) {
        navigate(isSeller ? "/seller-pending" : "/login");
      } else {
        setError(data.message);
      }

    } catch (error) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex flex-col items-center justify-center px-4 py-8">

      {/* Card */}
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-sm">

        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="text-center cursor-pointer mb-6"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent tracking-wide hover:scale-105 transition">
  Qyro
</h1>
        </div>

        <h2 className="text-xl font-semibold text-white text-center mb-6">
          Create your account
        </h2>

        <form onSubmit={submitHandler} noValidate className="space-y-5">

          {/* Error message */}
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg border border-red-400/20">
              {error}
            </p>
          )}

          {/* Full name */}
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 transition-all"
          />

          {/* Email */}
          <input
            type="email"
            placeholder="Email Address (e.g. example@gmail.com)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 transition-all"
          />

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setStrength(checkPasswordStrength(e.target.value));
                }}
                className="w-full px-4 py-3 pr-10 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Password strength */}
            {password && (
              <div className="mt-2">
                <PasswordStrengthBar strength={strength} />
                <p className={`text-xs mt-1 font-medium ${
                  strength === "Strong" ? "text-green-400" :
                  strength === "Medium" ? "text-orange-300" :
                  "text-red-400"
                }`}>
                  Password Strength: {strength}
                </p>
              </div>
            )}
          </div>

          {/* Seller toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="seller-check"
              checked={isSeller}
              onChange={(e) => setIsSeller(e.target.checked)}
              className="w-4 h-4 accent-pink-500 cursor-pointer"
            />
            <label
              htmlFor="seller-check"
              className="text-sm text-gray-300 cursor-pointer"
            >
              Register as a Seller
            </label>
          </div>

          {/* Seller fields */}
          {isSeller && (
            <div className="space-y-3 p-4 bg-white/10 rounded-xl border border-white/20">

              <input
                type="text"
                placeholder="Shop Name"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-xl text-sm outline-none focus:border-indigo-400 transition-all"
              />

              <textarea
                placeholder="Shop Description (optional)"
                value={shopDescription}
                onChange={(e) => setShopDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-xl text-sm outline-none focus:border-indigo-400 resize-none"
              />

              <p className="text-xs text-pink-300">
                ⚠️ Seller accounts require admin approval before selling.
              </p>

            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-3 rounded-xl transition-all duration-300 ${
              loading
                ? "bg-gray-500/20 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-pink-500 to-indigo-500 hover:scale-[1.02] hover:shadow-lg text-white"
            }`}
          >
            {loading
              ? "Creating account..."
              : isSeller ? "Apply as Seller" : "Create Account"}
          </button>

        </form>

      </div>

      {/* Login link */}
      <p className="mt-6 text-sm text-gray-300">
        Already have an account?{" "}
        <span
          onClick={() => navigate("/login")}
          className="text-pink-400 cursor-pointer font-medium hover:underline"
        >
          Login
        </span>
      </p>

    </div>
  );
}

export default Register;