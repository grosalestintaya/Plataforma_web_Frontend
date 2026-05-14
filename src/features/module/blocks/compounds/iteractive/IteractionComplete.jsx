import React, {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getCardItemId } from "./cardIteraction/cardInteractionRegistry";

function normalizeIds(ids) {
  if (!Array.isArray(ids)) return [];

  return Array.from(
    new Set(
      ids
        .map((id) => String(id ?? "").trim())
        .filter(Boolean),
    ),
  );
}

function getItemsFromChildren(children) {
  return Children.toArray(children).flatMap((child) => {
    if (!isValidElement(child)) return [];

    const items = child.props?.items;

    if (!Array.isArray(items)) return [];

    return items;
  });
}

function getRequiredIds(children, requiredIds) {
  if (Array.isArray(requiredIds) && requiredIds.length > 0) {
    return normalizeIds(requiredIds);
  }

  const items = getItemsFromChildren(children);

  return normalizeIds(
    items.map((item, index) => {
      return getCardItemId(item, index);
    }),
  );
}

export default function IteractionComplete({
  id,
  view,
  heroApi,
  requiredIds,
  type = "iteractionComplete",
  countsTowardScore = false,
  scoreOnComplete = 100,
  children,
}) {
  const viewId = view?.id ?? view?.viewId ?? id;

  const normalizedRequiredIds = useMemo(() => {
    return getRequiredIds(children, requiredIds);
  }, [children, requiredIds]);

  const requiredKey = normalizedRequiredIds.join("|");

  const [completedIds, setCompletedIds] = useState([]);

  const completed =
    normalizedRequiredIds.length > 0 &&
    normalizedRequiredIds.every((itemId) => completedIds.includes(itemId));

  function completeItem(itemId) {
    const normalizedId = String(itemId ?? "").trim();

    if (!normalizedId) return;

    setCompletedIds((previous) => {
      if (previous.includes(normalizedId)) return previous;

      return [...previous, normalizedId];
    });
  }

  useEffect(() => {
    setCompletedIds([]);
  }, [requiredKey, viewId]);

  useEffect(() => {
    if (!viewId) return;

    heroApi?.setInteractiveState?.(viewId, {
      type,
      completed,
      completedIds,
      completedCount: completedIds.length,
      total: normalizedRequiredIds.length,
      score: completed ? scoreOnComplete : 0,
      countsTowardScore,
    });
  }, [
    viewId,
    type,
    completed,
    completedIds,
    normalizedRequiredIds.length,
    scoreOnComplete,
    countsTowardScore,
    heroApi,
  ]);

  function renderChild(child) {
    if (!isValidElement(child)) return child;

    const originalOnComplete = child.props?.onComplete;

    return cloneElement(child, {
      onComplete: (itemId, item, index) => {
        completeItem(itemId);
        originalOnComplete?.(itemId, item, index);
      },
    });
  }

  return <>{Children.map(children, renderChild)}</>;
}