import Image from "./Image";
import Typografia from "./Typografia";
import { cn } from "@/shared/libs/utils";

function CompareItem({ item }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <Image src={item?.img?.src} alt={item?.img?.alt ?? item?.label ?? "item"} />

      {item?.label && (
        <Typografia className="break-words" content={item.label} />
      )}

      {item?.note && (
        <Typografia
          className="max-w-[260px] break-words"
          content={item.note}
        />
      )}

      {item?.result && (
        <Typografia className="mt-1" content={item.result} />
      )}
    </div>
  );
}

export default function Compare2Cards({ items = [], className }) {
  const left = items?.[0];
  const right = items?.[1];

  return (
    <div className={cn("w-full flex items-center justify-center", className)}>
      <div className="w-full max-w-[820px] grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompareItem item={left} />
        <CompareItem item={right} />
      </div>
    </div>
  );
}
