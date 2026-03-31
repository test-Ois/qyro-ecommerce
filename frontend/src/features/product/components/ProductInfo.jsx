import RatingStars from "../../../components/common/RatingStars";

export default function ProductInfo({ product, finalPrice, rawPrice, discount, rating, numReviews }) {
  return (
    <>
      {product.category && (
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.25em] text-purple-300">
          {product.category}
        </p>
      )}

      <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl">
        {product.name}
      </h1>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-3xl font-bold text-yellow-400 sm:text-4xl">₹{finalPrice.toFixed(0)}</span>
        {discount > 0 && <span className="text-base text-gray-400 line-through">₹{rawPrice}</span>}
      </div>

      <div className="mt-2 flex items-center gap-3 text-sm text-gray-300">
        <RatingStars value={rating} />
        <span>{rating?.toFixed(1) || 0} ({numReviews || 0} reviews)</span>
      </div>

      <p className="mt-5 text-sm leading-7 text-gray-300 sm:text-base">{product.description}</p>
    </>
  );
}
