import Badge from "../../../components/common/Badge";

export default function ProductBadges({ discount, isDeal }) {
  if (!discount && !isDeal) return null;

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {discount > 0 && <Badge type="success">{discount}% OFF</Badge>}
      {isDeal && <Badge type="info">Deal</Badge>}
    </div>
  );
}
