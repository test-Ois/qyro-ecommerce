import useNewsletter from "../../hooks/useNewsletter";

function Newsletter() {
  const { email, setEmail, subscribe, loading, success } = useNewsletter();

  return (
    <div className="border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row justify-between items-center gap-6">

        <div>
          <h3 className="text-white text-lg font-medium">
            Stay in the loop ✦
          </h3>
          <p className="text-gray-400 text-sm">
            Get exclusive deals & updates
          </p>
        </div>

        {success ? (
          <span className="text-green-400 text-sm">Subscribed ✓</span>
        ) : (
          <div className="flex gap-2">
            <input
              aria-label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-white focus:border-violet-500"
            />
            <button
              onClick={subscribe}
              className="bg-gradient-to-r from-violet-600 to-purple-500 px-5 py-2 rounded-lg text-white hover:scale-105 transition"
            >
              {loading ? "..." : "Subscribe"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Newsletter;