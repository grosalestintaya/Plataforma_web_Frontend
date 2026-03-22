import activityImage001 from "@/assets/activity/image001.png";

export default function Image({
  src = "",
  alt = "Imagen",
  className = "",
  placeholderLabel = "Imagen",
}) {
  // Si el contenido no define src, usa la imagen base de actividades.
  const resolvedSrc = src || activityImage001;
  const resolvedAlt = alt || placeholderLabel || "Imagen";

  return (
    <div className={`flex h-full w-full items-center justify-center ${className}`}>
      <img
        src={resolvedSrc}
        alt={resolvedAlt}
        className="h-[150px] w-auto object-contain md:h-[170px]"
      />
    </div>
  );
}
