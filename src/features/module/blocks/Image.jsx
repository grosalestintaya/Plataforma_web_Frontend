export default function Image({
  src = "",
  alt = "Imagen",
  className = "",
  placeholderLabel = "Imagen",
}) {
  if (!src) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="grid h-[170px] w-[300px] place-items-center border border-white/20 px-4 text-center text-white/70 text-sm font-semibold">
          {placeholderLabel}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`}>
      <img src={src} alt={alt} className="h-[150px] md:h-[170px] w-auto object-contain" />
    </div>
  );
}
