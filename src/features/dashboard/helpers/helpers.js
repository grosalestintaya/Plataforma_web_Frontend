export const INSIGNIA_BASE = "/insignias"; // public/insignias/*.png
export const AVATAR_BASE = "/avatars"; // public/avatars/*.png

export function getInitials(fullName = "") {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return (parts[0][0] || "U").toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function resolveInsignia(pinnedImg) {
  if (!pinnedImg) return `${INSIGNIA_BASE}/default.png`;
  return `${INSIGNIA_BASE}/${pinnedImg}`;
}

export function resolveAvatar(imgKey) {
  if (!imgKey) return `${AVATAR_BASE}/default.png`;
  return `${AVATAR_BASE}/${imgKey}.png`;
}
