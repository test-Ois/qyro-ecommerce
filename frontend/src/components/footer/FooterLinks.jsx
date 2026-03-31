import { Link } from "react-router-dom";
import { FOOTER_LINKS } from "../../constants/footerData";

function FooterLinks() {
  return (
    <>
      {Object.entries(FOOTER_LINKS).map(([title, items]) => (
        <div key={title}>
          <h3 className="text-white font-semibold mb-4 tracking-wide">
            {title}
          </h3>

          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className="text-gray-400 hover:text-white hover:translate-x-1 transition-all duration-200 block"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

export default FooterLinks;