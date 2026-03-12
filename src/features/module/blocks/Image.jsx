export default function Image({ src = "", alt = "Imagen", className = "" }) {
  if (!src) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className}`}>
        <div className="h-[170px] w-[300px] border border-white/20 bg-black/20 grid place-items-center text-white/70 text-sm">
          Imagen
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