export function Button({ children, className = "", onClick, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`px-4 py-2 font-semibold rounded-xl transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
