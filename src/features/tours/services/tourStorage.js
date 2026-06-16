const KEY = "quipu-tour";

export function loadTour() {
  try {
    const data = localStorage.getItem(KEY);
    return data
      ? JSON.parse(data)
      : { active: false, routeIndex: 0, stepIndex: 0, completed: false };
  } catch {
    return { active: false, routeIndex: 0, stepIndex: 0, completed: false };
  }
}

export function saveTour(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearTour() {
  localStorage.removeItem(KEY);
}
