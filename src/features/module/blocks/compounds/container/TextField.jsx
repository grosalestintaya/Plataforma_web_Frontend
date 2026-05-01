import Typography from "../../base/Typography";
import Input from "../../base/Action/Input";
import { cn } from "@/shared/libs/utils";

export default function TextField({
  prompt,
  value = "",
  onChange,
  placeholder = "Escribe tu respuesta...",
  variant = "stacked",
  containerClassName = "",
  labelClassName = "",
  fieldWrapClassName = "",
  inputClassName = "",
}) {
  if (!prompt) return null;

  const isSplit = variant === "split";

  return (
    <section
      className={cn(
        isSplit
          ? "grid h-full min-h-0 w-full grid-cols-[minmax(220px,0.9fr)_minmax(0,1.6fr)] gap-2 rounded-xl border border-white/30 p-2"
          : "grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] gap-2 rounded-xl border border-white/30 p-2",
        containerClassName,
      )}
    >
      <div
        className={cn(
          isSplit
            ? "flex min-h-0 items-center rounded-md border border-white/30 px-3 py-2"
            : "min-h-0 rounded-md border border-white/30 px-3 py-2",
          labelClassName,
        )}
      >
        <Typography
          content={prompt}
          variant={prompt?.variant ?? "helper"}
          color={prompt?.color}
          align={prompt?.align}
          component={prompt?.component}
          className={prompt?.className}
        />
      </div>
      <div
        className={cn(
          "flex min-h-0 rounded-md border border-white/30 p-2",
          fieldWrapClassName,
        )}
      >
        <Input
          variant="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn("h-full min-h-0 self-stretch", inputClassName)}
        />
      </div>
    </section>
  );
}
