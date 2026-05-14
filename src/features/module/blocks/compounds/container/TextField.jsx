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
  if (!prompt && !placeholder) return null;

  const isSplit = variant === "split";

  return (
    <section
      className={cn(
        "grid min-h-0 w-full min-w-0 gap-2 rounded-2xl border border-white/10 bg-white/5 p-2",
        "overflow-visible",

        /**
         * Mobile:
         * Siempre apilado para evitar cortes horizontales.
         */
        "grid-cols-1 grid-rows-[auto_auto]",

        /**
         * md+:
         * Split sólo si se solicita.
         */
        isSplit &&
          "md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:grid-rows-1 md:items-stretch",

        containerClassName,
      )}
    >
      {prompt ? (
        <div
          className={cn(
            "flex min-h-0 min-w-0 items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2",
            "overflow-hidden",
            labelClassName,
          )}
        >
          <Typography
            content={prompt}
            variant={prompt?.variant ?? "helper"}
            color={prompt?.color}
            align={prompt?.align ?? "center"}
            component={prompt?.component}
            className={cn(
              "w-full min-w-0 leading-tight [text-wrap:balance]",
              prompt?.className,
            )}
          />
        </div>
      ) : null}

      <div
        className={cn(
          "flex min-h-[2.75rem] min-w-0 items-center rounded-xl border border-white/10 bg-white/5 px-3 py-2",
          "overflow-hidden",
          fieldWrapClassName,
        )}
      >
        <Input
          variant="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            "h-auto min-h-[2rem] w-full min-w-0 self-center",
            inputClassName,
          )}
        />
      </div>
    </section>
  );
}