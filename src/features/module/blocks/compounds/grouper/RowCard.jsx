import Card from "../container/Card";

/**
 * RowCard:
 * - Distribuye tarjetas en una fila flexible.
 * - Refleja el "ShowCards" del documento cuando se muestran 2 o mas tarjetas.
 */
export default function RowCard({ items = [] }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}
    >
      {items.map((item, index) => (
        <Card
          key={item?.id ?? index}
          media={item?.media}
          title={item?.title}
          text={item?.text}
          className="h-full"
        />
      ))}
    </div>
  );
}
