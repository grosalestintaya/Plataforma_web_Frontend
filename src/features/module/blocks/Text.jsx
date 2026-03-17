export default function Text({ children, className = "" }) {
  return (
    <p className={`text-center text-white/95 font-semibold text-sm md:text-base leading-relaxed whitespace-pre-line py-4 ${className}`}>
      {children}
    </p>
  );
}