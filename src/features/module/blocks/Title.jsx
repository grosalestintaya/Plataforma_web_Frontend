export default function Title({ children, className = "" }) {
  return (
    <h2
      className={`text-center text-white font-extrabold tracking-tight text-xl md:text-2xl leading-tight ${className}`}
    >
      {children}
    </h2>
  );
}