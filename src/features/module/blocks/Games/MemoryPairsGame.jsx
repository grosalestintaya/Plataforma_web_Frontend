import { useMemo, useState } from "react";
import { cn } from "@/shared/libs/utils";
import Image from "./Image";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function MemoryPairsGame({
  cards = [],
  grid = { cols: 4, rows: 3 },
  finishLabel = "Fin",
  onFinish,
}) {
  const deck = useMemo(() => shuffle(cards), [cards]);
  const totalPairs = useMemo(() => new Set(deck.map((c) => c.pairId)).size, [deck]);

  const [open, setOpen] = useState([]); // indices abiertos
  const [matched, setMatched] = useState(() => new Set());

  const isComplete = matched.size === totalPairs && totalPairs > 0;

  function pick(idx) {
    const card = deck[idx];
    if (!card) return;
    if (matched.has(card.pairId)) return;
    if (open.includes(idx)) return;
    if (open.length === 2) return;

    const nextOpen = [...open, idx];
    setOpen(nextOpen);

    if (nextOpen.length === 2) {
      const [aIdx, bIdx] = nextOpen;
      const a = deck[aIdx];
      const b = deck[bIdx];

      if (a.pairId === b.pairId) {
        const next = new Set(matched);
        next.add(a.pairId);

        setTimeout(() => {
          setMatched(next);
          setOpen([]);
        }, 200);
      } else {
        setTimeout(() => setOpen([]), 650);
      }
    }
  }

  return (
    <div className="h-full w-full grid grid-rows-[1fr_auto] gap-4">
      {/* tablero */}
      <div
        className="grid gap-3 place-content-center"
        style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))` }}
      >
        {deck.map((c, idx) => {
          const faceUp = open.includes(idx) || matched.has(c.pairId);

          return (
            <button
              key={c.id ?? idx}
              type="button"
              onClick={() => pick(idx)}
              className={cn(
                "aspect-square rounded-sm border border-white/20 bg-black/10",
                "flex items-center justify-center hover:bg-black/20 transition"
              )}
            >
              {faceUp ? (
                <Image src={c.img} alt="carta" className="h-[70%]" />
              ) : (
                <div className="text-white/40 text-xs">?</div>
              )}
            </button>
          );
        })}
      </div>

      {/* botón Fin (solo habilita al completar) */}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={!isComplete}
          onClick={onFinish}
          className="h-9 px-5 rounded bg-black/20 border border-white/20 text-white font-semibold disabled:opacity-40"
        >
          {finishLabel}
        </button>
      </div>
    </div>
  );
}