import { useEffect } from "react";

export function useMissionStatePersistence({ heroApi, viewId, snapshot }) {
  useEffect(() => {
    if (!viewId || !snapshot) return;
    heroApi?.setInteractiveState?.(viewId, snapshot);
  }, [heroApi, snapshot, viewId]);
}
