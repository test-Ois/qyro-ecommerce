import { SOCIAL_LINKS } from "../../constants/footerData";

function FooterBrand() {
  return (
    <div className="lg:col-span-2">
      <h2 className="text-white text-2xl font-bold mb-3">Qyro</h2>

      <p className="text-gray-400 max-w-xs">
        Premium shopping experience crafted for modern users.
      </p>

      {/* SOCIAL */}
      <div className="flex gap-3 mt-5">
        {SOCIAL_LINKS.map((s) => (
          <a
            key={s.label}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            className="group w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:scale-110 hover:border-violet-500/40 transition"
          >
            <i className={`${s.icon} text-gray-400 group-hover:text-violet-400`} />
          </a>
        ))}
      </div>

      {/* CONTACT */}
      <div className="mt-6 text-gray-400 text-xs space-y-2">
        <p>📞 +91 9798413263</p>
        <p>✉️ qayoomakhtar72@gmail.com</p>
      </div>
    </div>
  );
}

export default FooterBrand;