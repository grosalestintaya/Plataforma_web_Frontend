import Typography from "../../base/Typography";
import Card from "../container/Card";

/**
 * CompareCard:
 * - Presenta dos tarjetas para contrastar conceptos lado a lado.
 * - Mantiene el contrato de Card + Card definido en la guia.
 */
export default function CompareCard({ items = [] }) {
  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((item, index) => (
        <Card
          key={item?.id ?? index}
          media={item?.img ?? item?.image}
          title={item?.label}
          text={item?.note}
          className="h-full"
          footer={
            item?.result ? (
              <Typography
                content={item.result}
                variant={item?.result?.variant ?? "label"}
                align={item?.result?.align ?? "center"}
              />
            ) : null
          }
        />
      ))}
    </div>
  );
}
