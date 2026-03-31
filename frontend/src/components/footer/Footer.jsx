import FooterBrand from "./FooterBrand";
import FooterLinks from "./FooterLinks";
import Newsletter from "./NewsLetter";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-[#080612] mt-20 text-gray-400 relative overflow-hidden">

      {/* Glow background */}
      <div className="absolute top-0 left-1/3 w-72 h-72 bg-violet-600/10 blur-3xl" />

      <Newsletter />

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

        <FooterBrand />

        <FooterLinks />

        {/* TRUST */}
        <div>
          <h3 className="text-smtext-white font-bold mb-2">
            Trust
          </h3>
          <ul className="text-gray-400 text-xs space-y-2">
            <li className="text-gray-400">✔ Secure Payments</li>
            <li className="text-gray-400">✔ Easy Returns</li>
            <li className="text-gray-400">✔ Fast Delivery</li>
          </ul>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-3 text-xs">

          <span>
            © {new Date().getFullYear()} Qyro. All rights reserved.
          </span>

          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </div>

          <span className="text-gray-500">
            Built with ❤️ by Qayoom
          </span>

        </div>
      </div>
    </footer>
  );
}

export default Footer;