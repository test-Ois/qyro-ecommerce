import { Link } from "react-router-dom";

export default function RelatedProducts({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="mt-10">
      <h3 className="text-xl font-bold text-white">Related Products</h3>
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-4">
        {data.map((item) => (
          <Link
            key={item._id}
            to={`/product/${item._id}`}
            className="rounded-2xl border border-white/10 bg-[#120422] p-3 transition hover:border-pink-500"
          >
            <img
              src={item.image || ""}
              alt={item.name}
              className="h-24 w-full rounded-lg object-cover"
            />
            <p className="mt-2 text-sm font-semibold text-white">{item.name}</p>
            <p className="text-xs text-gray-300">₹{item.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
