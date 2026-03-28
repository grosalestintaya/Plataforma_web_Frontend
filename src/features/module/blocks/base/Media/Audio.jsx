
export default function Audio({
  src = "",
  className = "",
  autoPlay = false,
  loop = false,
  controls = true,
}) {
  if (!src) return null;

  return (
    <audio
      src={src}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      className={["w-full", className].join(" ")}
    >
      Tu navegador no soporta audio.
    </audio>
  );
}
