import { useEffect, useState } from "react";

function SplashScreen({ onFinish }) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // start animation
    const start = setTimeout(() => setAnimate(true), 100);

    // end splash
    const end = setTimeout(() => {
      onFinish();
    }, 2900); // perfect timing

    return () => {
      clearTimeout(start);
      clearTimeout(end);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#070014] z-[9999] overflow-hidden">

      {/* Glow background */}
      <div className="absolute w-[300px] h-[300px] bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 blur-3xl opacity-20 animate-pulse rounded-full"></div>

      {/* Logo */}
      <div
        className={`text-center transition-all duration-[1800ms] ${
          animate ? "scale-100 opacity-100" : "scale-50 opacity-0"
        }`}
      >
        <h1 className="text-6xl font-bold tracking-wide">
          <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Qyro
          </span>
        </h1>

        {/* Tagline */}
        <p
          className={`mt-4 text-gray-400 text-sm transition-all duration-1000 ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Premium Shopping Experience
        </p>
      </div>
    </div>
  );
}

export default SplashScreen;