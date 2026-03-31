import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ForgotPassword(){

  const navigate = useNavigate();
  const [email,setEmail] = useState("");

  const submitHandler = async(e)=>{

    e.preventDefault();

    const res = await fetch(
      "http://localhost:5000/api/auth/send-otp",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify({ email })
      }
    );

    const data = await res.json();

    if(res.ok){

      alert("OTP sent to email");

      navigate("/verify-otp",{
        state:{ email }
      });

    }else{

      alert(data.message);

    }

  };

  return(

    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center px-4">

      <form 
        onSubmit={submitHandler}
        className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl p-8 w-full max-w-sm space-y-5"
      >

        <div className="flex items-center justify-center gap-2 mb-2">

  <h2 className="text-xl font-semibold text-white text-center">
    Reset Password
  </h2>

  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6 text-yellow-400"
  >
    <path
      fillRule="evenodd"
      d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
      clipRule="evenodd"
    />
  </svg>

</div>

        <p className="text-sm text-gray-300 text-center">
          Enter your email to receive OTP
        </p>

        <input
          type="email"
          placeholder="Enter your email"
          required
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-white/10 border border-white/20 text-white placeholder-gray-300 rounded-xl text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 transition-all"
        />

        <button
          type="submit"
          className="w-full font-semibold py-3 rounded-xl bg-gradient-to-r from-pink-500 to-indigo-500 hover:scale-[1.02] hover:shadow-lg text-white transition-all duration-300"
        >
          Send OTP
        </button>

        <p 
          onClick={()=>navigate("/login")}
          className="text-sm text-center text-pink-400 cursor-pointer hover:underline"
        >
          Back to Login
        </p>

      </form>

    </div>

  );

}

export default ForgotPassword;