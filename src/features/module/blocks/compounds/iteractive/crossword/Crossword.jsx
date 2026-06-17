import { useMemo } from "react";
import { cn } from "@/shared/libs/utils";
import Typography from "../../../base/Typography";
import Card from "../../container/Card";
import { prepareWords, useCrosswordController } from "./crosswordController";

const BOARD_GAP_PX = 6;
const BOARD_PADDING_PX = 24;
const MIN_CELL_SIZE_PX = 26;
const PANEL_CLASS =
  "rounded-[1.5rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:p-4 xl:rounded-[1.8rem]";
const BOARD_TITLE_CLASS =
  "text-[clamp(1rem,0.86rem+0.55vw,1.5rem)] font-black text-white";
const BOARD_INPUT_CLASS =
  "h-full w-full rounded-[0.7rem] bg-transparent text-center font-black uppercase text-current outline-none";
const BOARD_BUTTON_CLASS =
  "flex h-full w-full items-center justify-center rounded-[0.7rem] font-black uppercase text-current transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/55";

const CELL_STATE_CLASS = {
  incorrect: "border-rose-400 bg-rose-200 text-rose-950",
  solved: "border-emerald-400 bg-emerald-200 text-emerald-950",
  active: "border-amber-300 bg-amber-50 text-slate-900",
  idle: "border-slate-700 bg-white text-slate-900",
};

const resolveAssetSrc = (value) => {
  const src = String(value ?? "").trim();
  if (!src) return "";
  if (/^(https?:|data:|blob:)/.test(src) || src.startsWith("/")) return src;
  return `/activity/${src.replace(/^activity\//, "")}`;
};

const getCellStateClass = (cell) => {
  if (cell.incorrect) return CELL_STATE_CLASS.incorrect;
  if (cell.correct || cell.solvedActiveWord || cell.solved) return CELL_STATE_CLASS.solved;
  if (cell.active) return CELL_STATE_CLASS.active;
  return CELL_STATE_CLASS.idle;
};

const getBoardCellSize = ({ width, height }, cols, rows) => {
  const availableWidth = Math.max(width - BOARD_PADDING_PX, 0);
  const availableHeight = Math.max(height - BOARD_PADDING_PX, 0);
  if (availableWidth <= 0 || availableHeight <= 0) return MIN_CELL_SIZE_PX;

  const fitWidth =
    (availableWidth - BOARD_GAP_PX * Math.max(cols - 1, 0)) / Math.max(cols, 1);
  const fitHeight =
    (availableHeight - BOARD_GAP_PX * Math.max(rows - 1, 0)) / Math.max(rows, 1);

  return Math.max(MIN_CELL_SIZE_PX, Math.floor(Math.min(fitWidth, fitHeight)));
};

const getBoardSizes = (boardCellSize) => ({
  letterSize: Math.max(18, Math.floor(boardCellSize * 0.58)),
  numberSize: Math.max(10, Math.floor(boardCellSize * 0.22)),
});

function CluePanel({ activeClue, activeSupportImage }) {
  const imageMedia = activeSupportImage?.src
    ? {
        src: activeSupportImage.src,
        alt: activeSupportImage.alt ?? "Imagen de apoyo",
        variant: activeSupportImage.variant ?? "square",
        mode: activeSupportImage.mode ?? "contain",
      }
    : null;

  return (
    <aside className={PANEL_CLASS}>
      <div className="grid gap-3">
        <div className="rounded-[1rem] border border-white/12 bg-black/10 px-4 py-3 text-center">
          <div className="text-[clamp(1rem,0.9rem+0.4vw,1.35rem)] font-black text-white">
            Pista
          </div>
        </div>

        <div
          className={cn(
            "grid gap-3",
            activeSupportImage?.src
              ? "grid-cols-[minmax(0,1fr)_7.5rem] sm:grid-cols-[minmax(0,1fr)_9rem] lg:grid-cols-1"
              : "grid-cols-1",
          )}
        >
          <div className="flex min-h-[8.5rem] items-center justify-center rounded-[1.2rem] border border-white/12 bg-black/10 px-5 py-6 text-center sm:min-h-[10rem] lg:min-h-[14rem]">
            <Typography
              content={{ text: activeClue, variant: "h2", align: "center" }}
            />
          </div>

          {imageMedia ? (
            <div className="h-[8.5rem] overflow-hidden rounded-[1.2rem] border border-white/12 bg-black/10 p-2 sm:h-[10rem] lg:h-[11rem]">
              <div className="flex h-full w-full items-center justify-center overflow-hidden [&>*]:h-full [&>*]:w-full [&_article]:h-full [&_article]:w-full [&_article]:max-w-full">
                <Card media={imageMedia} variant="ghost" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function BoardCell({
  cell,
  activeDraft,
  inputRefs,
  letterSize,
  numberSize,
  onSelect,
  onBeforeInput,
  onInput,
  onKeyDown,
  onFocusIndex,
}) {
  if (cell.blocked) {
    return <div key={cell.key} className="aspect-square rounded-[0.8rem] bg-transparent" />;
  }

  const isInputCell = cell.active && !cell.solvedActiveWord && cell.activeIndex !== null;

  return (
    <div
      key={cell.key}
      className={cn(
        "relative aspect-square rounded-[0.85rem] border-2 shadow-[0_8px_18px_rgba(15,23,42,0.14)] transition",
        getCellStateClass(cell),
      )}
    >
      {cell.number ? (
        <span
          className="absolute left-1 top-1 z-10 font-black text-slate-700"
          style={{ fontSize: `${numberSize}px` }}
        >
          {cell.number}
        </span>
      ) : null}

      {isInputCell ? (
        <input
          ref={(node) => {
            inputRefs.current[cell.activeIndex] = node;
          }}
          value={activeDraft[cell.activeIndex] ?? ""}
          onClick={() => {
            onSelect(cell);
            onFocusIndex(cell.activeIndex);
          }}
          onBeforeInput={(event) => onBeforeInput(cell.activeIndex, event)}
          onChange={(event) => onInput(cell.activeIndex, event.target.value)}
          onKeyDown={(event) => onKeyDown(cell.activeIndex, event)}
          className={cn(
            BOARD_INPUT_CLASS,
            cell.locked && "cursor-default",
          )}
          style={{ fontSize: `${letterSize}px` }}
          maxLength={1}
          inputMode="text"
          aria-label={`Letra ${cell.activeIndex + 1}`}
        />
      ) : (
        <button
          type="button"
          onClick={() => onSelect(cell)}
          className={BOARD_BUTTON_CLASS}
          style={{ fontSize: `${letterSize}px` }}
        >
          {cell.displayLetter ?? ""}
        </button>
      )}
    </div>
  );
}

export default function Crossword({ data = {}, heroApi, view, className = "" }) {
  const crossword = data?.crossword ?? data ?? {};
  const preparedWords = useMemo(() => prepareWords(crossword?.words), [crossword?.words]);
  const {
    boardBackground = data?.boardBackground ?? null,
    sidebarImage = data?.sidebarImage ?? null,
    minimumScore = 60,
    maximumScore = 100,
  } = crossword;
  const viewId = view?.id ?? view?.viewId;
  const {
    activeClue,
    activeSupportImage,
    boardViewportRef,
    boardViewportSize,
    handleBeforeInput,
    handleInput,
    handleKeyDown,
    inputRefs,
    model,
    selectWordFromCell,
    setNextFocusIndex,
  } = useCrosswordController({
    heroApi,
    viewId,
    preparedWords,
    sidebarImage,
    scoreConfig: {
      minimumScore,
      maximumScore,
    },
  });

  const { boardCellSize, letterSize, numberSize } = useMemo(() => {
    const cellSize = getBoardCellSize(boardViewportSize, model.cols, model.rows);
    return { boardCellSize: cellSize, ...getBoardSizes(cellSize) };
  }, [boardViewportSize, model.cols, model.rows]);
  const boardBackgroundStyle = useMemo(
    () =>
      boardBackground?.src
        ? { backgroundImage: `url(${resolveAssetSrc(boardBackground.src)})` }
        : null,
    [boardBackground?.src],
  );

  return (
    <section
      className={cn(
        "grid min-h-full w-full min-w-0 grid-rows-[minmax(0,1fr)] gap-3 text-white sm:gap-4",
        className,
      )}
    >
      <main className="grid min-h-0 gap-3 lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[18rem_minmax(0,1fr)] xl:gap-4">
        <CluePanel activeClue={activeClue} activeSupportImage={activeSupportImage} />

        <section className={cn(PANEL_CLASS, "grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3")}>
          <div className="rounded-[1.1rem] border border-white/12 bg-white/6 px-4 py-3 text-center">
            <div className={BOARD_TITLE_CLASS}>Encuentra las palabras</div>
          </div>

          <div
            ref={boardViewportRef}
            className="relative flex min-h-[26rem] min-w-0 items-center justify-center overflow-auto rounded-[1.35rem] border border-white/12 bg-black/10 p-3 sm:min-h-[32rem] sm:p-4 xl:min-h-0"
          >
            {boardBackgroundStyle ? (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-45"
                style={boardBackgroundStyle}
                aria-hidden="true"
              />
            ) : null}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),rgba(255,255,255,0.04)_48%,rgba(15,23,42,0.28)_100%)]" />

            <div
              className="relative grid"
              style={{
                gap: `${BOARD_GAP_PX}px`,
                gridTemplateColumns: `repeat(${model.cols}, ${boardCellSize}px)`,
              }}
            >
              {model.boardCells.map((cell) => (
                <BoardCell
                  key={cell.key}
                  cell={cell}
                  activeDraft={model.activeDraft}
                  inputRefs={inputRefs}
                  letterSize={letterSize}
                  numberSize={numberSize}
                  onSelect={selectWordFromCell}
                  onBeforeInput={handleBeforeInput}
                  onInput={handleInput}
                  onKeyDown={handleKeyDown}
                  onFocusIndex={setNextFocusIndex}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
    </section>
  );
}
