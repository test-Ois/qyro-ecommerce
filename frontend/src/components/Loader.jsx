function Loader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#070014] z-[9999]">
      <div className="relative">
        
        {/* Glow */}
        <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 opacity-40 animate-pulse rounded-full"></div>

        {/* Logo */}
        <div className="relative text-5xl font-bold text-white animate-bounce">
          <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            Q
          </span>
        </div>

      </div>
    </div>
  );
}

export default Loader;