import { useEffect, useMemo, useRef, useState } from "react";

const normalizeBase = (value) =>
  String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const normalizeWord = (value) =>
  normalizeBase(value).trim().replace(/\s+/g, "").toUpperCase();
const normalizeLetters = (value) =>
  normalizeBase(value).replace(/[^a-zA-Z]/g, "").toUpperCase().split("");

const getWordId = (word, index) => word?.id ?? `word-${index}`;
const getCellKey = (row, col) => `${row}-${col}`;
const getIsPortraitViewport = () =>
  typeof window !== "undefined" && window.innerWidth < window.innerHeight;
const DEFAULT_MINIMUM_SCORE = 60;
const DEFAULT_MAXIMUM_SCORE = 100;
const EMPTY_BOUNDS = { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 };
const EMPTY_WORD_STATE = {
  values: [],
  lockedIndexes: new Set(),
  firstEditableIndex: 0,
};
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const normalizeDrafts = (drafts) =>
  drafts && typeof drafts === "object" ? drafts : {};
const normalizeWordIdList = (value) =>
  Array.isArray(value)
    ? [...new Set(value.filter((item) => item !== null && item !== undefined))]
    : [];

function getScoreConfig(scoreConfig) {
  const minimumScore = clamp(
    Number(scoreConfig?.minimumScore ?? DEFAULT_MINIMUM_SCORE) || 0,
    0,
    DEFAULT_MAXIMUM_SCORE,
  );
  const maximumScore = clamp(
    Number(scoreConfig?.maximumScore ?? DEFAULT_MAXIMUM_SCORE) || minimumScore,
    minimumScore,
    DEFAULT_MAXIMUM_SCORE,
  );

  return {
    minimumScore,
    maximumScore,
  };
}

function calculateCrosswordScore({
  completed,
  solvedWordIds,
  retriedWordIds,
  totalWords,
  minimumScore,
  maximumScore,
}) {
  const safeTotalWords = Math.max(0, Number(totalWords) || 0);
  if (!safeTotalWords) return 0;

  const solvedCount = solvedWordIds.length;

  if (!completed) {
    return clamp(
      Math.round((solvedCount / safeTotalWords) * Math.max(minimumScore - 1, 0)),
      0,
      Math.max(minimumScore - 1, 0),
    );
  }

  const retriedSet = new Set(retriedWordIds);
  const minimumPerWord = minimumScore / safeTotalWords;
  const bonusPerWord = (maximumScore - minimumScore) / safeTotalWords;
  const totalScore = solvedWordIds.reduce((sum, wordId) => {
    return sum + minimumPerWord + (retriedSet.has(wordId) ? 0 : bonusPerWord);
  }, 0);

  return clamp(Math.round(totalScore), minimumScore, maximumScore);
}

const getNextPendingWordId = (words, solvedWordIds) => {
  const solvedSet = new Set(solvedWordIds ?? []);
  return words.find((word) => !solvedSet.has(word.id))?.id ?? words[0]?.id ?? null;
};

export const prepareWords = (words) =>
  (Array.isArray(words) ? words : []).map((word, index) => ({
    ...word,
    id: getWordId(word, index),
    number: Number(word?.number ?? index + 1),
    answer: normalizeWord(word?.answer),
  }));

const getCellsForWord = (word) =>
  Array.from({ length: word.answer.length }, (_, index) => ({
    row: word.row + (word.direction === "down" ? index : 0),
    col: word.col + (word.direction === "across" ? index : 0),
    index,
    letter: word.answer[index],
  }));

const withCells = (word) => ({ ...word, cells: getCellsForWord(word) });

const getWordCells = (word) =>
  Array.isArray(word?.cells) ? word.cells : getCellsForWord(word);

function forEachWordCell(words, visit) {
  for (const word of words) {
    for (const cell of getWordCells(word)) {
      visit(word, cell);
    }
  }
}

function getBounds(words) {
  if (!words.length) return EMPTY_BOUNDS;

  let minRow = Infinity;
  let maxRow = -Infinity;
  let minCol = Infinity;
  let maxCol = -Infinity;

  forEachWordCell(words, (_, cell) => {
    minRow = Math.min(minRow, cell.row);
    maxRow = Math.max(maxRow, cell.row);
    minCol = Math.min(minCol, cell.col);
    maxCol = Math.max(maxCol, cell.col);
  });

  return { minRow, maxRow, minCol, maxCol };
}

function buildOccupancy(words) {
  const occupancy = new Map();

  forEachWordCell(words, (word, cell) => {
    const key = getCellKey(cell.row, cell.col);
    const current = occupancy.get(key) ?? {
      letter: cell.letter,
      directions: new Set(),
    };

    current.directions.add(word.direction);
    occupancy.set(key, current);
  });

  return occupancy;
}

function canPlaceWord(word, row, col, direction, occupancy, requireCrossing) {
  const beforeKey =
    direction === "across" ? getCellKey(row, col - 1) : getCellKey(row - 1, col);
  const afterKey =
    direction === "across"
      ? getCellKey(row, col + word.answer.length)
      : getCellKey(row + word.answer.length, col);

  if (occupancy.has(beforeKey) || occupancy.has(afterKey)) return null;

  let crossings = 0;

  for (let index = 0; index < word.answer.length; index += 1) {
    const cellRow = row + (direction === "down" ? index : 0);
    const cellCol = col + (direction === "across" ? index : 0);
    const key = getCellKey(cellRow, cellCol);
    const existing = occupancy.get(key);

    if (existing) {
      if (
        existing.letter !== word.answer[index] ||
        existing.directions.has(direction)
      ) {
        return null;
      }

      crossings += 1;
      continue;
    }

    if (direction === "across") {
      if (
        occupancy.has(getCellKey(cellRow - 1, cellCol)) ||
        occupancy.has(getCellKey(cellRow + 1, cellCol))
      ) {
        return null;
      }
    } else if (
      occupancy.has(getCellKey(cellRow, cellCol - 1)) ||
      occupancy.has(getCellKey(cellRow, cellCol + 1))
    ) {
      return null;
    }
  }

  return requireCrossing && crossings === 0 ? null : { crossings };
}

function scorePlacement(candidate, placedWords, isPortrait) {
  const bounds = getBounds([...placedWords, candidate]);
  const width = bounds.maxCol - bounds.minCol + 1;
  const height = bounds.maxRow - bounds.minRow + 1;
  const area = width * height;
  const aspectPenalty = isPortrait
    ? Math.max(0, width - height)
    : Math.max(0, height - width);

  return candidate.crossings * 1000 - area * 8 - aspectPenalty * 20;
}

function findBestPlacement(word, placedWords, isPortrait) {
  const occupancy = buildOccupancy(placedWords);
  const bounds = getBounds(placedWords);
  const directions = isPortrait ? ["down", "across"] : ["across", "down"];
  const offset = word.answer.length + 2;
  const rowStart = bounds.minRow - offset;
  const rowEnd = bounds.maxRow + offset;
  const colStart = bounds.minCol - offset;
  const colEnd = bounds.maxCol + offset;
  let bestCandidate = null;

  const tryCandidate = (candidate) => {
    if (!candidate) return;

    const scored = {
      ...candidate,
      score: scorePlacement(candidate, placedWords, isPortrait),
    };

    if (!bestCandidate || scored.score > bestCandidate.score) {
      bestCandidate = scored;
    }
  };

  for (const placedWord of placedWords) {
    const direction = placedWord.direction === "across" ? "down" : "across";

    for (const placedCell of placedWord.cells) {
      for (let index = 0; index < word.answer.length; index += 1) {
        if (placedCell.letter !== word.answer[index]) continue;

        const row = placedCell.row - (direction === "down" ? index : 0);
        const col = placedCell.col - (direction === "across" ? index : 0);
        const match = canPlaceWord(word, row, col, direction, occupancy, true);

        tryCandidate(
          match
            ? {
                ...word,
                row,
                col,
                direction,
                crossings: match.crossings,
              }
            : null,
        );
      }
    }
  }

  if (bestCandidate) return bestCandidate;

  for (const direction of directions) {
    for (let row = rowStart; row <= rowEnd; row += 1) {
      for (let col = colStart; col <= colEnd; col += 1) {
        const match = canPlaceWord(word, row, col, direction, occupancy, false);

        tryCandidate(
          match ? { ...word, row, col, direction, crossings: 0 } : null,
        );
      }
    }
  }

  return bestCandidate;
}

function generateLayout(words, isPortrait) {
  const sortedWords = [...words].sort(
    (left, right) => right.answer.length - left.answer.length,
  );

  if (!sortedWords.length) return { words: [], rows: 0, cols: 0 };

  const placedWords = [
    withCells({
      ...sortedWords[0],
      row: 0,
      col: 0,
      direction: isPortrait ? "down" : "across",
    }),
  ];

  for (const word of sortedWords.slice(1)) {
    const placement = findBestPlacement(word, placedWords, isPortrait);
    if (placement) placedWords.push(withCells(placement));
  }

  const bounds = getBounds(placedWords);
  const normalizedWords = placedWords.map((word) =>
    withCells({
      ...word,
      row: word.row - bounds.minRow,
      col: word.col - bounds.minCol,
    }),
  );

  return {
    words: normalizedWords.sort((left, right) => left.number - right.number),
    rows: bounds.maxRow - bounds.minRow + 1,
    cols: bounds.maxCol - bounds.minCol + 1,
  };
}

function buildSolvedCells(words, solvedSet) {
  const solvedCells = new Map();

  forEachWordCell(words, (word, cell) => {
    if (!solvedSet.has(word.id)) return;
    solvedCells.set(getCellKey(cell.row, cell.col), cell.letter);
  });

  return solvedCells;
}

function buildOverlapIndex(words) {
  const overlapIndex = new Map();

  forEachWordCell(words, (word, cell) => {
    const key = getCellKey(cell.row, cell.col);
    const current = overlapIndex.get(key) ?? [];
    current.push({ wordId: word.id, index: cell.index });
    overlapIndex.set(key, current);
  });

  return overlapIndex;
}

function getSolvedLetter(solvedCells, row, col) {
  return solvedCells.get(getCellKey(row, col)) ?? "";
}

function getWordState(word, drafts, solvedCells) {
  if (!word) return EMPTY_WORD_STATE;

  const values = [];
  const lockedIndexes = new Set();
  let firstEditableIndex = -1;

  for (const cell of word.cells) {
    const solvedLetter = getSolvedLetter(solvedCells, cell.row, cell.col);
    values[cell.index] = solvedLetter || drafts?.[word.id]?.[cell.index] || "";

    if (solvedLetter) lockedIndexes.add(cell.index);
    else if (firstEditableIndex === -1) firstEditableIndex = cell.index;
  }

  return {
    values,
    lockedIndexes,
    firstEditableIndex: firstEditableIndex >= 0 ? firstEditableIndex : 0,
  };
}

function buildBoardCells(
  words,
  rows,
  cols,
  activeWord,
  activeValues,
  lockedIndexes,
  solvedSet,
  incorrectSet,
  drafts,
  solvedCells,
) {
  const boardMap = new Map();

  for (const word of words) {
    const isSolved = solvedSet.has(word.id);
    const isActive = word.id === activeWord?.id;
    const isIncorrect = incorrectSet.has(word.id);
    const wordDraft = drafts?.[word.id] ?? [];

    for (const cell of word.cells) {
      const key = getCellKey(cell.row, cell.col);
      const current = boardMap.get(key) ?? {
        key,
        row: cell.row,
        col: cell.col,
        number: null,
        wordIds: [],
        blocked: false,
        solved: false,
        solvedActiveWord: false,
        active: false,
        incorrect: false,
        correct: false,
        displayLetter: "",
        activeIndex: null,
        locked: false,
        activeDraftLetter: "",
        fallbackDraftLetter: "",
      };

      if (!current.wordIds.includes(word.id)) current.wordIds.push(word.id);
      if (cell.index === 0) current.number ??= word.number;
      const draftLetter = wordDraft[cell.index] ?? "";

      if (isSolved) {
        current.solved = true;
        if (isActive) current.solvedActiveWord = true;
      }

      if (isActive) {
        current.active = true;
        current.activeIndex = cell.index;
        current.locked = lockedIndexes.has(cell.index);
        current.activeDraftLetter = activeValues[cell.index] ?? "";
      }

      if (!current.fallbackDraftLetter && draftLetter) {
        current.fallbackDraftLetter = draftLetter;
      }

      if (draftLetter === cell.letter) current.correct = true;
      if (isIncorrect && draftLetter && draftLetter !== cell.letter) {
        current.incorrect = true;
      }

      boardMap.set(key, current);
    }
  }

  for (const current of boardMap.values()) {
    const solvedLetter = getSolvedLetter(solvedCells, current.row, current.col);

    if (solvedLetter) {
      current.displayLetter = solvedLetter;
      current.correct = true;
      current.incorrect = false;
      continue;
    }

    current.displayLetter =
      current.activeDraftLetter || current.fallbackDraftLetter || "";
  }

  return Array.from({ length: rows * cols }, (_, index) => {
    const row = Math.floor(index / cols);
    const col = index % cols;

    return (
      boardMap.get(getCellKey(row, col)) ?? {
        key: getCellKey(row, col),
        row,
        col,
        blocked: true,
        wordIds: [],
      }
    );
  }).map((cell) => {
    if (cell.blocked) return cell;

    const { activeDraftLetter, fallbackDraftLetter, ...rest } = cell;
    return rest;
  });
}

const findNextEditableIndex = (length, lockedIndexes, startIndex) => {
  for (let index = Math.max(startIndex, 0); index < length; index += 1) {
    if (!lockedIndexes.has(index)) return index;
  }

  return null;
};

const findPreviousEditableIndex = (lockedIndexes, startIndex) => {
  for (let index = startIndex; index >= 0; index -= 1) {
    if (!lockedIndexes.has(index)) return index;
  }

  return null;
};

const getVisibleCursorIndex = (cursorIndex, length, lockedIndexes, fallbackIndex) =>
  findNextEditableIndex(length, lockedIndexes, cursorIndex) ??
  findPreviousEditableIndex(lockedIndexes, Math.min(cursorIndex, length - 1)) ??
  fallbackIndex;
const getCellMatchIndex = (word, cell) =>
  word?.cells.findIndex(
    (wordCell) => wordCell.row === cell.row && wordCell.col === cell.col,
  ) ?? 0;

function syncDraftsForWord(word, nextValues, drafts, overlapIndex, wordById, solvedSet) {
  if (!word) return drafts;

  const nextDrafts = { ...drafts, [word.id]: nextValues };

  for (const cell of word.cells) {
    const sharedCells = overlapIndex.get(getCellKey(cell.row, cell.col)) ?? [];
    const nextLetter = nextValues[cell.index] ?? "";

    for (const sharedCell of sharedCells) {
      if (sharedCell.wordId === word.id || solvedSet.has(sharedCell.wordId)) continue;

      const sharedWord = wordById.get(sharedCell.wordId);
      if (!sharedWord) continue;

      const sharedDraft = [
        ...(nextDrafts[sharedCell.wordId] ??
          Array(sharedWord.answer.length).fill("")),
      ];
      sharedDraft[sharedCell.index] = nextLetter;
      nextDrafts[sharedCell.wordId] = sharedDraft;
    }
  }

  return nextDrafts;
}

export function useCrosswordController({
  heroApi,
  viewId,
  preparedWords,
  sidebarImage,
  scoreConfig,
}) {
  const { minimumScore, maximumScore } = useMemo(
    () => getScoreConfig(scoreConfig),
    [scoreConfig],
  );
  const wordSignature = useMemo(
    () =>
      preparedWords
        .map((word) => `${word.id}:${word.answer}:${word.number}`)
        .join("|"),
    [preparedWords],
  );
  const persistedState = useMemo(
    () => heroApi?.getInteractiveState?.(viewId)?.payload ?? {},
    [heroApi, viewId],
  );
  const initialSolvedWordIds = Array.isArray(persistedState?.solvedWordIds)
    ? persistedState.solvedWordIds
    : [];
  const initialDrafts = normalizeDrafts(persistedState?.drafts);
  const initialRetriedWordIds = normalizeWordIdList(persistedState?.retriedWordIds);

  const [isPortraitViewport, setIsPortraitViewport] = useState(getIsPortraitViewport);
  const [solvedWordIds, setSolvedWordIds] = useState(() => initialSolvedWordIds);
  const [drafts, setDrafts] = useState(() => initialDrafts);
  const [retriedWordIds, setRetriedWordIds] = useState(() => initialRetriedWordIds);
  const [activeWordId, setActiveWordId] = useState(() =>
    getNextPendingWordId(preparedWords, initialSolvedWordIds),
  );
  const [cursorIndex, setCursorIndex] = useState(0);
  const [incorrectWordIds, setIncorrectWordIds] = useState([]);
  const [boardViewportSize, setBoardViewportSize] = useState({
    width: 0,
    height: 0,
  });

  const inputRefs = useRef([]);
  const boardViewportRef = useRef(null);
  const lastHandledInputRef = useRef(null);
  const hydrationKeyRef = useRef(`${viewId ?? ""}::${wordSignature}`);

  const layout = useMemo(
    () => generateLayout(preparedWords, isPortraitViewport),
    [preparedWords, isPortraitViewport],
  );
  const wordById = useMemo(
    () => new Map(layout.words.map((word) => [word.id, word])),
    [layout.words],
  );
  const overlapIndex = useMemo(() => buildOverlapIndex(layout.words), [layout.words]);
  const solvedSet = useMemo(() => new Set(solvedWordIds), [solvedWordIds]);
  const incorrectSet = useMemo(() => new Set(incorrectWordIds), [incorrectWordIds]);
  const solvedCells = useMemo(
    () => buildSolvedCells(layout.words, solvedSet),
    [layout.words, solvedSet],
  );
  const activeState = useMemo(() => {
    const word = wordById.get(activeWordId) ?? layout.words[0] ?? null;
    return {
      word,
      ...getWordState(word, drafts, solvedCells),
    };
  }, [activeWordId, drafts, layout.words, solvedCells, wordById]);
  const activeWord = activeState.word;
  const boardCells = useMemo(
    () =>
      buildBoardCells(
        layout.words,
        layout.rows,
        layout.cols,
        activeWord,
        activeState.values,
        activeState.lockedIndexes,
        solvedSet,
        incorrectSet,
        drafts,
        solvedCells,
      ),
    [
      activeState.lockedIndexes,
      activeState.values,
      activeWord,
      drafts,
      incorrectSet,
      layout.cols,
      layout.rows,
      layout.words,
      solvedCells,
      solvedSet,
    ],
  );

  const completed =
    layout.words.length > 0 && solvedWordIds.length === layout.words.length;
  const score = useMemo(
    () =>
      calculateCrosswordScore({
        completed,
        solvedWordIds,
        retriedWordIds,
        totalWords: layout.words.length,
        minimumScore,
        maximumScore,
      }),
    [
      completed,
      layout.words.length,
      maximumScore,
      minimumScore,
      retriedWordIds,
      solvedWordIds,
    ],
  );
  const wordLength = activeWord?.answer.length ?? 0;
  const visibleCursorIndex = getVisibleCursorIndex(
    cursorIndex,
    wordLength,
    activeState.lockedIndexes,
    activeState.firstEditableIndex,
  );
  const activeClue =
    activeWord?.clue ?? "Haz click sobre una palabra del tablero para ver su pista.";
  const activeSupportImage = activeWord?.image ?? sidebarImage ?? null;

  const clearIncorrectWord = (wordId = activeWord?.id) => {
    if (!wordId) return;
    setIncorrectWordIds((current) => current.filter((id) => id !== wordId));
  };

  const setDraftForActiveWord = (nextValues) => {
    if (!activeWord) return;
    setDrafts((current) =>
      syncDraftsForWord(
        activeWord,
        nextValues,
        current,
        overlapIndex,
        wordById,
        solvedSet,
      ),
    );
  };

  const finishActiveWord = (isCorrect) => {
    if (!activeWord) return;

    if (isCorrect) {
      clearIncorrectWord(activeWord.id);
      if (solvedSet.has(activeWord.id)) return;

      const nextSolvedWordIds = [...solvedWordIds, activeWord.id];
      setSolvedWordIds(nextSolvedWordIds);
      setActiveWordId(getNextPendingWordId(layout.words, nextSolvedWordIds));
      setCursorIndex(0);
      return;
    }

    setRetriedWordIds((current) =>
      current.includes(activeWord.id) ? current : [...current, activeWord.id],
    );
    setIncorrectWordIds((current) =>
      current.includes(activeWord.id) ? current : [...current, activeWord.id],
    );
    setCursorIndex(activeState.firstEditableIndex);
  };

  const typeLetters = (letters, startIndex = cursorIndex) => {
    if (!activeWord || !letters.length) return;

    const nextValues = [...activeState.values];
    let nextCursor = Math.max(startIndex, 0);

    for (const letter of letters) {
      let consumed = false;

      while (nextCursor < wordLength) {
        if (activeState.lockedIndexes.has(nextCursor)) {
          if (nextValues[nextCursor] === letter) {
            nextCursor += 1;
            consumed = true;
            break;
          }

          nextCursor += 1;
          continue;
        }

        nextValues[nextCursor] = letter;
        nextCursor += 1;
        consumed = true;
        break;
      }

      if (!consumed) break;
    }

    clearIncorrectWord(activeWord.id);
    setDraftForActiveWord(nextValues);

    const nextEditableIndex = findNextEditableIndex(
      wordLength,
      activeState.lockedIndexes,
      nextCursor,
    );

    if (nextEditableIndex === null && nextValues.every(Boolean)) {
      finishActiveWord(nextValues.join("") === activeWord.answer);
      return;
    }

    setCursorIndex(nextCursor);
  };

  const deleteBackward = () => {
    if (!activeWord) return;

    const nextValues = [...activeState.values];
    const targetIndex = findPreviousEditableIndex(
      activeState.lockedIndexes,
      Math.min(cursorIndex - 1, wordLength - 1),
    );

    if (targetIndex === null) {
      setCursorIndex(activeState.firstEditableIndex);
      return;
    }

    nextValues[targetIndex] = "";
    clearIncorrectWord(activeWord.id);
    setDraftForActiveWord(nextValues);
    setCursorIndex(targetIndex);
  };

  const moveCursor = (index, direction) =>
    setCursorIndex(
      direction === "left"
        ? (findPreviousEditableIndex(
            activeState.lockedIndexes,
            Math.min(index, cursorIndex) - 1,
          ) ?? activeState.firstEditableIndex)
        : (findNextEditableIndex(
            wordLength,
            activeState.lockedIndexes,
            Math.max(index, cursorIndex) + 1,
          ) ?? wordLength),
    );

  const handleBeforeInput = (index, event) => {
    if (!activeWord) return;

    if (event?.inputType === "deleteContentBackward") {
      event.preventDefault();
      deleteBackward();
    }
  };

  const handleInput = (index, rawValue) => {
    if (!activeWord) return;

    const letters = normalizeLetters(rawValue);
    if (!letters.length) return;

    const latestLetter = letters.at(-1);
    const lastHandled = lastHandledInputRef.current;

    if (
      latestLetter &&
      lastHandled &&
      lastHandled.index === index &&
      lastHandled.letter === latestLetter
    ) {
      lastHandledInputRef.current = null;
      return;
    }

    if (latestLetter) typeLetters([latestLetter], cursorIndex);
  };

  const handleKeyDown = (index, event) => {
    if (!activeWord) return;

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveCursor(index, "left");
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveCursor(index, "right");
      return;
    }

    if (event.key === "Backspace") {
      event.preventDefault();
      deleteBackward();
      return;
    }

    if (/^[a-zA-Z]$/.test(event.key)) {
      event.preventDefault();
      const letter = event.key.toUpperCase();
      lastHandledInputRef.current = {
        index,
        letter,
      };
      typeLetters([letter], cursorIndex);
    }
  };

  const selectWordFromCell = (cell) => {
    const wordIds = Array.isArray(cell?.wordIds) ? cell.wordIds : [];
    if (!wordIds.length) return;

    const nextWordId =
      wordIds.length === 1
        ? wordIds[0]
        : wordIds[
            (Math.max(wordIds.findIndex((wordId) => wordId === activeWordId), -1) +
              1) %
              wordIds.length
          ];
    const nextWord = wordById.get(nextWordId);

    setActiveWordId(nextWordId);
    setCursorIndex(
      nextWordId === activeWordId
        ? Math.max(getCellMatchIndex(nextWord, cell), 0)
        : 0,
    );
  };

  useEffect(() => {
    const nextHydrationKey = `${viewId ?? ""}::${wordSignature}`;
    if (hydrationKeyRef.current === nextHydrationKey) return;

    hydrationKeyRef.current = nextHydrationKey;
    setSolvedWordIds(initialSolvedWordIds);
    setDrafts(initialDrafts);
    setRetriedWordIds(initialRetriedWordIds);
    setActiveWordId(getNextPendingWordId(preparedWords, initialSolvedWordIds));
    setCursorIndex(0);
    setIncorrectWordIds([]);
  }, [
    initialDrafts,
    initialRetriedWordIds,
    initialSolvedWordIds,
    preparedWords,
    viewId,
    wordSignature,
  ]);

  useEffect(() => {
    const element = boardViewportRef.current;
    if (!element || typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver(([entry]) => {
      if (!entry) return;

      setBoardViewportSize((current) =>
        current.width === entry.contentRect.width &&
        current.height === entry.contentRect.height
          ? current
          : {
              width: entry.contentRect.width,
              height: entry.contentRect.height,
            },
      );
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleResize = () => setIsPortraitViewport(getIsPortraitViewport());
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!viewId) return;

    heroApi?.setInteractiveState?.(viewId, {
      completed,
      type: "crossword",
      score,
      solvedWords: solvedWordIds.length,
      totalWords: layout.words.length,
      payload: {
        solvedWordIds,
        drafts,
        activeWordId,
        retriedWordIds,
      },
    });
  }, [
    activeWordId,
    completed,
    drafts,
    heroApi,
    layout.words.length,
    retriedWordIds,
    score,
    solvedWordIds,
    viewId,
  ]);

  useEffect(() => {
    if (!wordById.has(activeWordId)) {
      setActiveWordId(getNextPendingWordId(layout.words, solvedWordIds));
      setCursorIndex(0);
    }
  }, [activeWordId, layout.words, solvedWordIds, wordById]);

  useEffect(() => {
    if (!activeWord || solvedSet.has(activeWord.id)) return;

    const target = inputRefs.current[visibleCursorIndex];
    if (target) {
      target.focus();
      target.select();
    }
  }, [activeWord, solvedSet, visibleCursorIndex]);

  return {
    activeClue,
    activeSupportImage,
    boardViewportRef,
    boardViewportSize,
    handleBeforeInput,
    handleInput,
    handleKeyDown,
    inputRefs,
    model: {
      rows: layout.rows,
      cols: layout.cols,
      boardCells,
      activeDraft: activeState.values,
    },
    selectWordFromCell,
    setNextFocusIndex: setCursorIndex,
  };
}
