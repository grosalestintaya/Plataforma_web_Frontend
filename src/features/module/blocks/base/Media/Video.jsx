
export default function Video({
  src = "",
  poster = "",
  className = "",
  autoPlay = false,
  loop = false,
  controls = true,
  muted = false,
}) {
  if (!src) return null;

  return (
    <video
      src={src}
      poster={poster}
      controls={controls}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      className={["h-auto w-full rounded-xl", className].join(" ")}
    >
      Tu navegador no soporta video.
    </video>
  );
}
