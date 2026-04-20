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
      className={
        isPair
          ? "mx-auto grid h-full min-h-0 w-full max-w-[920px] place-items-center content-start gap-4 overflow-visible p-1 md:grid-cols-2"
          : "grid h-full min-h-0 w-full place-items-center content-start gap-4 overflow-hidden"
      }
      style={
        isPair
          ? {
              "--card-media-max-height":
                "min(270px, calc(var(--hero-height, 100vh) * 0.29))",
            }
          : {
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              "--card-media-max-height":
                "min(270px, calc(var(--hero-height, 100vh) * 0.29))",
            }
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
          className="max-w-full gap-2"
          mediaClassName="p-1"
          contentClassName="gap-0.5"
        />
      ))}
    </div>
  );
}
