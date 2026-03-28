
function TextInput({
  value = "",
  onChange,
  placeholder = "Escribe aqui...",
  name,
  className = "",
}) {
  return (
    <input
      type="text"
      name={name}
      value={value}
      onChange={(event) => onChange?.(event.target.value, event)}
      placeholder={placeholder}
      className={[
        "w-full rounded-xl border border-white/20 bg-black/10 px-4 py-2.5 text-sm text-white",
        "outline-none placeholder:text-white/40 focus:border-white/35",
        className,
      ].join(" ")}
    />
  );
}

function RadioInput({
  name = "radio-input",
  options = [],
  value = "",
  onChange,
  className = "",
}) {
  if (!Array.isArray(options) || options.length === 0) return null;

  return (
    <div className={["space-y-2", className].join(" ")}>
      {options.map((option, index) => {
        const optionValue = option?.value ?? option?.id ?? String(index);
        const optionLabel = option?.label ?? optionValue;

        return (
          <label
            key={optionValue}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/20 bg-black/10 px-3 py-2"
          >
            <input
              type="radio"
              name={name}
              value={optionValue}
              checked={String(value) === String(optionValue)}
              onChange={(event) => onChange?.(event.target.value, event)}
              className="h-4 w-4"
            />
            <span className="text-sm text-white/90">{optionLabel}</span>
          </label>
        );
      })}
    </div>
  );
}

export default function Input({ variant = "text", ...props }) {
  if (variant === "radio") return <RadioInput {...props} />;
  return <TextInput {...props} />;
}
