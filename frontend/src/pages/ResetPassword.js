import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import PasswordStrengthBar from "../components/PasswordStrengthBar";

import {
  checkPasswordStrength,
  validatePassword
} from "../utils/passwordUtils";

function ResetPassword() {

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [strength, setStrength] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      alert("Session expired. Please request OTP again.");
      navigate("/forgot-password");
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

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {

      const res = await fetch(
        "http://localhost:5000/api/auth/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert("Password reset successful ✅");
        navigate("/login");
      } else {
        setError(data.message);
      }

    } catch (error) {
      setError("Server error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center px-4">

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-sm">

        {/* Icon */}
        <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🔒</span>
        </div>

        <h2 className="text-2xl font-semibold text-white text-center mb-1">
          Create New Password
        </h2>
        <p className="text-gray-300 text-sm text-center mb-6">
          Must be at least 8 characters
        </p>

        <form onSubmit={submitHandler} className="space-y-5">

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg border border-red-400/20">
              {error}
            </p>
          )}

          {/* New password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
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

          {/* Confirm password */}
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 pr-10 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white transition"
            >
              {showConfirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          {/* Match indicator */}
          {confirmPassword && (
            <p className={`text-xs font-medium ${
              password === confirmPassword ? "text-green-400" : "text-red-400"
            }`}>
              {password === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
            </p>
          )}

          {/* Button */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 hover:scale-[1.02] hover:shadow-lg text-white font-semibold py-3 rounded-xl transition-all duration-300"
          >
            Create Password
          </button>

        </form>

      </div>

    </div>
  );
}

export default ResetPassword;