
import Typography from "../Typography";

/**
 * Input base:
 * - `text` mantiene un input controlado simple.
 * - `radio` acepta labels string u objetos tipograficos.
 */
function TextInput({
  value = "",
  onChange,
  placeholder = "Escribe aqui...",
  name,
  disabled = false,
  inputMode = "text",
  autoComplete = "off",
  className = "",
}) {
  return (
    <input
      type="text"
      inputMode={inputMode}
      autoComplete={autoComplete}
      name={name}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.value, event)}
      placeholder={placeholder}
      className={[
        "w-full rounded-xl border border-white/20 bg-neutral-200/70 px-4 py-2.5 text-sm text-black",
        "outline-none placeholder:text-black/60 focus:border-white/35 disabled:cursor-not-allowed disabled:opacity-60",
        className,
      ].join(" ")}
    />
  );
}

function renderOptionLabel(optionLabel) {
  if (
    typeof optionLabel === "string" ||
    typeof optionLabel === "number" ||
    Array.isArray(optionLabel)
  ) {
    return (
      <Typography
        content={{ text: String(optionLabel), variant: "bodySm" }}
        variant="bodySm"
        color="secondary"
      />
    );
  }

  return (
    <Typography
      content={optionLabel}
      variant={optionLabel?.variant ?? "bodySm"}
      color={optionLabel?.color ?? "secondary"}
      align={optionLabel?.align ?? "left"}
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
            <div className="min-w-0 flex-1">{renderOptionLabel(optionLabel)}</div>
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
