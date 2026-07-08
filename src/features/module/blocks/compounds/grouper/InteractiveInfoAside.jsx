import Button from "../../base/Action/Button";
import Typography from "../../base/Typography";
import Card from "../container/Card";
import { cn } from "@/shared/libs/utils";

function InfoCell({ label, value }) {
  return (
    <div className="min-w-0 rounded-[1.05rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.04))] p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
      <Typography
        content={{
          text: label,
          variant: "helper",
          align: "left",
          color: "secondary",
        }}
      />

      <Typography
        content={{
          text: value,
          variant: "h3",
          align: "left",
        }}
        className="mt-2 break-words"
      />
    </div>
  );
}

function StatSection({ section }) {
  return (
    <div className="rounded-[1.35rem] border border-[#ffe08a]/35 bg-[radial-gradient(circle_at_top_left,rgba(255,231,167,0.14),transparent_32%),linear-gradient(180deg,rgba(131,96,255,0.22),rgba(64,40,140,0.28))] p-3 shadow-[0_12px_24px_rgba(30,20,70,0.22)]">
      <Typography
        content={{
          text: section.label,
          variant: "helper",
          align: "left",
          color: "secondary",
        }}
      />
      <Typography
        content={{
          text: section.value,
          variant: "h1",
          align: "left",
        }}
        className="mt-2"
      />
      {section.description ? (
        <Typography
          content={{
            text: section.description,
            variant: "bodySm",
            align: "left",
            color: "secondary",
          }}
          className="mt-2"
        />
      ) : null}
    </div>
  );
}

function CardsSection({ section }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        section.fill ? "min-h-0 flex-1" : "",
        section.className,
      )}
    >
      {section.title ? (
        <div className="rounded-[1rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.05))] px-4 py-3">
          <Typography
            content={{
              text: section.title,
              variant: "h3",
              align: "left",
            }}
            className="leading-none"
          />
          {section.description ? (
            <Typography
              content={{
                text: section.description,
                variant: "bodySm",
                align: "left",
                color: "secondary",
              }}
              className="mt-2"
            />
          ) : null}
        </div>
      ) : null}

      <div
        className={cn(
          "grid gap-3",
          section.scrollable ? "min-h-0 overflow-y-auto pr-1" : "",
          section.columns === 1
            ? "grid-cols-1"
            : section.columns === 3
              ? "grid-cols-1 min-[420px]:grid-cols-3"
              : "grid-cols-2",
        )}
      >
        {section.items?.map((item) => (
          <Card
            key={item.id ?? item.title}
            title={{
              text: item.title,
              variant: "cardTitle",
              align: "center",
            }}
            text={{
              text: item.text,
              variant: "cardText",
              align: "center",
              color: "secondary",
            }}
            media={item.media}
            variant={item.variant ?? "solid"}
            size={item.size ?? "normal"}
          />
        ))}
      </div>
    </div>
  );
}

function MessageSection({ section }) {
  const toneClass =
    section.tone === "success"
      ? "border-emerald-300/35 bg-emerald-500/10"
      : "border-amber-300/28 bg-amber-500/10";

  return (
    <div className={cn("rounded-[1.2rem] border p-2.5", toneClass)}>
      {section.title ? (
        <Typography
          content={{
            text: section.title,
            variant: "h2",
            align: "left",
          }}
        />
      ) : null}

      {section.description ? (
        <Typography
          content={{
            text: section.description,
            variant: "bodySm",
            align: "left",
            color: "secondary",
          }}
          className={section.title ? "mt-2" : ""}
        />
      ) : null}
    </div>
  );
}

function ActionSection({ section }) {
  return (
    <>
      {section.title ? (
        <Typography
          content={{
            text: section.title,
            variant: "h2",
            align: "left",
          }}
        />
      ) : null}

      {section.description ? (
        <Typography
          content={{
            text: section.description,
            variant: "bodySm",
            align: "left",
            color: "secondary",
          }}
          className={section.title ? "mt-2" : "mb-3"}
        />
      ) : null}

      <Button
        variant={section.buttonVariant ?? "primary"}
        label={section.buttonLabel}
        onClick={section.onClick}
        disabled={section.disabled}
        fullWidth
      />
    </>
  );
}

function AsideSection({ section }) {
  if (!section) return null;

  if (section.kind === "stat") {
    return <StatSection section={section} />;
  }

  if (section.kind === "grid") {
    return (
      <div className="gap-2">
        {section.title ? (
          <div className="mb-2 rounded-[1rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.10),rgba(255,255,255,0.05))] px-4 py-3">
            <Typography
              content={{
                text: section.title,
                variant: "h3",
                align: "left",
              }}
              className="leading-none"
            />
          </div>
        ) : null}

        <div className="grid gap-2 min-[380px]:grid-cols-2">
          {section.items?.map((item) => (
            <InfoCell
              key={`${section.id}-${item.label}`}
              label={item.label}
              value={item.value}
            />
          ))}
        </div>
      </div>
    );
  }

  if (section.kind === "cards") {
    return <CardsSection section={section} />;
  }

  if (section.kind === "message") {
    return <MessageSection section={section} />;
  }

  if (section.kind === "action") {
    return <ActionSection section={section} />;
  }

  return (
    <div className="rounded-[1.2rem] border border-white/12 bg-[radial-gradient(circle_at_top_left,rgba(130,98,255,0.16),transparent_34%),linear-gradient(180deg,rgba(19,14,49,0.92),rgba(30,20,72,0.86))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      {section.title ? (
        <Typography
          content={{
            text: section.title,
            variant: "h2",
            align: "left",
          }}
        />
      ) : null}

      {section.description ? (
        <Typography
          content={{
            text: section.description,
            variant: "bodySm",
            align: "left",
            color: "secondary",
          }}
          className={section.title ? "mt-3" : ""}
        />
      ) : null}
    </div>
  );
}

export default function InteractiveInfoAside({
  title,
  sections = [],
  className = "",
}) {
  return (
    <aside
      className={cn(
        "flex min-h-0 min-w-0 flex-col gap-4 overflow-hidden rounded-[2rem] border border-white/18 p-5",
        "bg-[radial-gradient(circle_at_top_left,rgba(120,92,255,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(73,42,160,0.30),transparent_34%),linear-gradient(180deg,rgba(19,14,49,0.96),rgba(34,21,82,0.90))]",
        className,
      )}
    >
      <Typography
        content={{
          text: title,
          variant: "h1",
          align: "left",
        }}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 overflow-y-auto">
        {sections.map((section) => (
          <AsideSection key={section.id} section={section} />
        ))}
      </div>
    </aside>
  );
}
