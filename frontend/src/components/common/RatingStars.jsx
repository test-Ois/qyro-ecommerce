export default function RatingStars({ value = 0 }) {
  const filled = Math.round(value);
  const stars = Array.from({ length: 5 }, (_, index) => index + 1);

  return (
    <div className="flex items-center gap-1">
      {stars.map((star) => (
        <span key={star} className={star <= filled ? "text-yellow-400" : "text-gray-500"}>
          ★
        </span>
      ))}
    </div>
  );
}
