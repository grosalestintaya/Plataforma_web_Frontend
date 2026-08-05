import { useEffect, useMemo, useRef, useState } from "react";
import Button from "../../base/Action/Button";
import Typography from "../../base/Typography";
import Card from "../container/Card";
import { cn } from "@/shared/libs/utils";

const TICK_MS = 32;
const BASKET_Y = 78;

function resolveAssetSrc(src) {
  const value = String(src ?? "").trim();
  if (!value || /^(https?:|data:|blob:|\/)/.test(value)) return value;
  return `/activity/${value.replace(/\\/g, "/").replace(/^(src\/assets\/activity\/|assets\/activity\/|activity\/|assets\/|\.\/)/, "")}`;
}

function formatAmount(value) {
  return `S/ ${Number(value ?? 0).toFixed(2)}`;
}

function flattenRounds(rounds, itemsById) {
  return (rounds ?? []).flatMap((round, roundIndex) =>
    round.map((itemId, itemIndex) => ({
      ...itemsById.get(itemId),
      runtimeId: `${roundIndex}-${itemIndex}-${itemId}`,
      round: roundIndex + 1,
    })),
  );
}

function FallingItem({ sprite }) {
  const positive = sprite.kind !== "expense";
  const amountLabel = `${positive ? "+" : "-"}${formatAmount(sprite.amount)}`;

  return (
    <div
      className="pointer-events-none absolute z-20 w-[clamp(6.5rem,9vw,8.25rem)] -translate-x-1/2"
      style={{ left: `${sprite.x}%`, top: `${sprite.y}%` }}
    >
      <Card
        title={{ text: sprite.label, variant: "cardTitle", align: "center" }}
        media={{
          ...sprite.media,
          src: resolveAssetSrc(sprite.media?.src),
          alt: sprite.media?.alt ?? sprite.label,
          variant: "square",
          mode: "cover",
        }}
        interaction={{
          type: "badge",
          content: amountLabel,
          className: cn(
            "-right-2 -top-2 min-h-9 min-w-9 whitespace-nowrap px-2 text-[0.68rem] shadow-[0_8px_14px_rgba(0,0,0,0.2)]",
            positive ? "bg-emerald-500" : "bg-rose-500",
          ),
        }}
        variant="bare"
        zoomable={false}
        className={cn(
          "h-auto overflow-visible rounded-xl border-[3px] bg-white/95 p-1 shadow-[0_12px_22px_rgba(15,45,112,0.25)]",
          positive ? "border-emerald-400" : "border-rose-400",
        )}
        contentClassName="min-h-[2.15rem] px-1.5 py-1"
        titleClassName={cn(
          "text-[clamp(0.68rem,1.15vw,0.82rem)] font-black leading-tight",
          positive ? "text-emerald-800" : "text-rose-800",
        )}
      />
    </div>
  );
}

export default function FallingObjects({
  items = [],
  rounds = [],
  targetAmount = 0,
  minimumCompletionAmount = targetAmount,
  spawnEveryMs = 650,
  maxActiveItems = 4,
  fallMin = 0.8,
  fallMax = 1.15,
  basketImage = "4/canasta-juego.webp",
  introTitle = "Cómo se juega",
  introText,
  startLabel = "Comenzar",
  roundLabel = "Semana",
  onStateChange,
  className,
}) {
  const itemsById = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );
  const queue = useMemo(
    () => flattenRounds(rounds, itemsById).filter((item) => item.id),
    [itemsById, rounds],
  );
  const [status, setStatus] = useState("idle");
  const [sprites, setSprites] = useState([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [basketX, setBasketX] = useState(50);
  const [collected, setCollected] = useState(0);
  const [history, setHistory] = useState([]);
  const [restartCount, setRestartCount] = useState(0);
  const lastSpawnRef = useRef(0);
  const lastTickRef = useRef(0);
  const queueIndexRef = useRef(0);
  const basketXRef = useRef(50);
  const collectedRef = useRef(0);
  const fieldRef = useRef(null);
  const spritesRef = useRef([]);
  const historyRef = useRef([]);

  const currentRound =
    sprites[0]?.round ?? queue[queueIndex]?.round ?? rounds.length;
  const completed = status === "completed";
  const failed = status === "failed";

  useEffect(() => {
    spritesRef.current = sprites;
  }, [sprites]);

  useEffect(() => {
    collectedRef.current = collected;
  }, [collected]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    onStateChange?.({
      collected,
      completed,
      failed,
      currentRound,
      completionWeek: completed ? currentRound : 0,
      restartCount,
      history,
    });
  }, [
    collected,
    completed,
    currentRound,
    failed,
    history,
    onStateChange,
    restartCount,
  ]);

  useEffect(() => {
    if (status !== "playing") return undefined;

    const timer = window.setInterval(() => {
      const now = performance.now();
      const elapsed = lastTickRef.current
        ? Math.min(now - lastTickRef.current, TICK_MS * 2)
        : TICK_MS;
      const frameRatio = elapsed / TICK_MS;
      lastTickRef.current = now;

      let next = spritesRef.current.map((sprite) => ({
        ...sprite,
        y: sprite.y + sprite.speed * frameRatio,
      }));

      const caught = next.filter(
        (sprite) =>
          sprite.y >= BASKET_Y &&
          sprite.y <= BASKET_Y + 8 &&
          Math.abs(sprite.x - basketXRef.current) <= 11,
      );

      if (caught.length) {
        const caughtIds = new Set(caught.map(({ runtimeId }) => runtimeId));
        const delta = caught.reduce(
          (sum, item) =>
            sum + (item.kind === "expense" ? -item.amount : item.amount),
          0,
        );
        const nextCollected = Math.max(0, collectedRef.current + delta);

        collectedRef.current = nextCollected;
        setCollected(nextCollected);
        const nextHistory = [
          ...historyRef.current,
          ...caught.map((item) => ({
            id: item.runtimeId,
            round: item.round,
            label: item.label,
            kind: item.kind,
            amount: item.kind === "expense" ? -item.amount : item.amount,
          })),
        ];

        historyRef.current = nextHistory;
        setHistory(nextHistory);

        next = next.filter(({ runtimeId }) => !caughtIds.has(runtimeId));
      }

      next = next.filter(({ y }) => y < 104);

      if (
        queueIndexRef.current < queue.length &&
        next.length < maxActiveItems &&
        now - lastSpawnRef.current >= spawnEveryMs
      ) {
        const item = queue[queueIndexRef.current];

        if (item) {
          next.push({
            ...item,
            x: 9 + Math.random() * 82,
            y: -18,
            speed: fallMin + Math.random() * Math.max(0, fallMax - fallMin),
          });

          queueIndexRef.current += 1;
          setQueueIndex(queueIndexRef.current);
          lastSpawnRef.current = now;
        }
      }

      if (collectedRef.current >= minimumCompletionAmount) {
        spritesRef.current = [];
        setSprites([]);
        onStateChange?.({
          collected: collectedRef.current,
          completed: true,
          failed: false,
          currentRound,
          completionWeek: currentRound,
          restartCount,
          history: historyRef.current,
        });
        setStatus("completed");
        return;
      }

      if (queueIndexRef.current >= queue.length && next.length === 0) {
        spritesRef.current = [];
        setSprites([]);
        setStatus("failed");
        return;
      }

      spritesRef.current = next;
      setSprites(next);
    }, TICK_MS);

    return () => window.clearInterval(timer);
  }, [
    fallMax,
    fallMin,
    maxActiveItems,
    minimumCompletionAmount,
    onStateChange,
    queue,
    spawnEveryMs,
    status,
  ]);

  function reset(nextStatus = "playing") {
    spritesRef.current = [];
    setSprites([]);
    setQueueIndex(0);
    queueIndexRef.current = 0;
    setCollected(0);
    setHistory([]);
    setBasketX(50);
    basketXRef.current = 50;
    lastSpawnRef.current = 0;
    lastTickRef.current = 0;
    collectedRef.current = 0;
    setStatus(nextStatus);
    fieldRef.current?.focus();
  }

  function handlePointerMove(event) {
    if (status !== "playing") return;
    const bounds = fieldRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const percentage = ((event.clientX - bounds.left) / bounds.width) * 100;
    const nextBasketX = Math.max(8, Math.min(92, percentage));
    basketXRef.current = nextBasketX;
    setBasketX(nextBasketX);
  }

  function handleKeyDown(event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const nextBasketX = Math.max(
      8,
      Math.min(92, basketXRef.current + (event.key === "ArrowLeft" ? -5 : 5)),
    );
    basketXRef.current = nextBasketX;
    setBasketX(nextBasketX);
  }

  return (
    <div
      ref={fieldRef}
      role="application"
      tabIndex={0}
      onPointerMove={handlePointerMove}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative h-full min-h-[28rem] overflow-hidden rounded-[1.7rem] border border-white/34 bg-[linear-gradient(180deg,#bdd7ff_0%,#9cc0fb_42%,#77a7ef_100%)] outline-none",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[14%] bg-[linear-gradient(180deg,#d98138_0%,#c66d23_100%)]" />

      {status !== "idle" ? (
        <div className="absolute left-4 top-4 z-30 rounded-xl bg-blue-800/85 px-4 py-2 text-sm font-black text-white">
          {roundLabel} {currentRound}
        </div>
      ) : null}

      {status === "playing" || status === "paused" ? (
        <Button
          label={status === "paused" ? "Continuar" : "Pausar"}
          variant="simple"
          onClick={() => setStatus(status === "paused" ? "playing" : "paused")}
          className="absolute right-4 top-4 z-40 w-auto"
        />
      ) : null}

      {sprites.map((sprite) => (
        <FallingItem key={sprite.runtimeId} sprite={sprite} />
      ))}

      <img
        src={resolveAssetSrc(basketImage)}
        alt="Canasta de recolección"
        className="pointer-events-none absolute bottom-[1.5%] z-30 w-[clamp(7rem,13vw,11rem)] -translate-x-1/2 object-contain"
        style={{ left: `${basketX}%` }}
      />

      {status === "idle" ? (
        <div className="absolute inset-0 z-50 grid place-items-center p-6 sm:p-8">
          <div className="w-full max-w-[40rem] rounded-[1.6rem] border border-white/35 bg-[linear-gradient(180deg,rgba(20,76,180,0.82),rgba(14,55,143,0.9))] px-6 py-7 text-center text-white shadow-[0_20px_40px_rgba(10,28,88,0.3)] backdrop-blur-[3px] sm:px-9 sm:py-9">
            <Typography
              content={{ text: introTitle, variant: "h2", align: "center" }}
            />
            <Typography
              content={{ text: introText, variant: "body", align: "center" }}
              className="mx-auto mt-4 max-w-[32rem] leading-relaxed"
            />
            <Button
              label={startLabel}
              variant="primary"
              onClick={() => reset("playing")}
              className="mt-6 min-w-[11rem]"
            />
          </div>
        </div>
      ) : null}

      {status === "paused" ? (
        <div className="absolute inset-0 z-40 grid place-items-center bg-blue-950/24 backdrop-blur-[2px]">
          <Button label="Continuar" onClick={() => setStatus("playing")} />
        </div>
      ) : null}

      {completed || failed ? (
        <div className="absolute inset-0 z-50 grid place-items-center bg-blue-950/30 p-6 backdrop-blur-[2px]">
          <div className="w-[min(100%,32rem)] min-w-0 rounded-3xl border border-white/30 bg-blue-800/95 p-7 text-center text-white">
            {" "}
            <Typography
              content={{
                text: completed ? "¡Meta alcanzada!" : "No alcanzaste la meta",
                variant: "h2",
                align: "center",
              }}
            />
            <Typography
              content={{
                text: `${formatAmount(collected)} de ${formatAmount(targetAmount)}`,
                variant: "h3",
                align: "center",
              }}
              className="mt-3"
            />
            {failed ? (
              <Button
                label="Volver a intentarlo"
                onClick={() => {
                  setRestartCount((value) => value + 1);
                  reset("playing");
                }}
                className="mt-5"
              />
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
