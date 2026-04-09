import Card from "../container/Card";

/**
 * showCard:
 * - Distribuye tarjetas en una fila flexible.
 * - Refleja el "ShowCards" del documento cuando se muestran 2 o mas tarjetas.
 */
export default function ShowCard({ items = [] }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const isPair = items.length === 2;

  return (
    <div
      className={isPair ? "mx-auto grid w-full max-w-[720px] gap-4 md:grid-cols-2" : "grid gap-4"}
      style={
        isPair
          ? undefined
          : { gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }
      }
    >
      {items.map((item, index) => (
        <Card
          key={item?.id ?? index}
          media={item?.media}
          title={item?.title}
          // La descripcion corta puede llegar como `text`, `description`
          // o `subtitle` segun el origen del JSON.
          // Tambien tolera `label` cuando un contenido antiguo vino con esa clave.
          text={item?.text ?? item?.description ?? item?.subtitle ?? item?.label ?? null}
          // En ShowCard limitamos un poco la imagen para asegurar que el
          // titulo y su descripcion corta se vean siempre en la misma tarjeta.
          className="h-full gap-2"
          mediaClassName="p-1"
          contentClassName="gap-1"
        />
      ))}
    </div>
  );
}
