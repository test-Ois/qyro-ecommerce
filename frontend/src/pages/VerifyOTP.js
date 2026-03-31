import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function VerifyOTP() {

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputs = useRef([]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const verifyOtp = async () => {
    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      alert("Please enter complete OTP");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp: finalOtp })
        }
      );

      const data = await res.json();

      if (res.ok) {
        navigate("/reset-password", { state: { email } });
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Something went wrong");
    }
  };

  const resendOtp = async () => {
    try {
      await fetch(
        "http://localhost:5000/api/auth/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email })
        }
      );
      setTimer(60);
      setCanResend(false);
    } catch (error) {
      alert("Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center px-4">

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-sm text-center">

        {/* Icon */}
        <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="currentColor"
  className="w-6 h-6 text-yellow-400"
>
  <path
    fillRule="evenodd"
    d="M5.478 5.559A1.5 1.5 0 0 1 6.912 4.5H9A.75.75 0 0 0 9 3H6.912a3 3 0 0 0-2.868 2.118l-2.411 7.838a3 3 0 0 0-.133.882V18a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3v-4.162c0-.299-.045-.596-.133-.882l-2.412-7.838A3 3 0 0 0 17.088 3H15a.75.75 0 0 0 0 1.5h2.088a1.5 1.5 0 0 1 1.434 1.059l2.213 7.191H17.89a3 3 0 0 0-2.684 1.658l-.256.513a1.5 1.5 0 0 1-1.342.829h-3.218a1.5 1.5 0 0 1-1.342-.83l-.256-.512a3 3 0 0 0-2.684-1.658H3.265l2.213-7.191Z"
    clipRule="evenodd"
  />
  <path
    fillRule="evenodd"
    d="M12 2.25a.75.75 0 0 1 .75.75v6.44l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3a.75.75 0 0 1 1.06-1.06l1.72 1.72V3a.75.75 0 0 1 .75-.75Z"
    clipRule="evenodd"
  />
</svg>        </div>

        <h2 className="text-2xl font-semibold text-white mb-2">
          Verify OTP
        </h2>

        <p className="text-gray-300 text-sm mb-6">
          Enter the 6 digit code sent to<br />
          <span className="font-medium text-white">{email}</span>
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              ref={el => inputs.current[index] = el}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-11 h-12 text-center text-xl font-bold bg-white/10 border border-white/20 text-white rounded-xl outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 transition-all"
            />
          ))}
        </div>

        {/* Verify Button */}
        <button
          onClick={verifyOtp}
          className="w-full bg-gradient-to-r from-pink-500 to-indigo-500 hover:scale-[1.02] hover:shadow-lg text-white font-semibold py-3 rounded-xl transition-all duration-300 mb-4"
        >
          Verify OTP
        </button>

        {/* Timer / Resend */}
        {!canResend ? (
          <p className="text-sm text-gray-300">
            Resend OTP in <span className="font-semibold text-white">{timer}s</span>
          </p>
        ) : (
          <p
            onClick={resendOtp}
            className="text-sm text-pink-400 cursor-pointer hover:underline font-medium"
          >
            Resend OTP
          </p>
        )}

      </div>

    </div>
  );
}

export default VerifyOTP;