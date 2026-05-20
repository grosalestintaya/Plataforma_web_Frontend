// src/hooks/useSEO.js
import { useEffect } from "react";

export function useSEO({ title, description, url }) {
  useEffect(() => {
    document.title = title;

    const setMeta = (name, content) => {
      let el = document.querySelector(`meta[name="${name}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("name", name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMeta("description", description);
    setMeta("og:title", title);
    setMeta("og:description", description);
    setMeta("og:url", url);
  }, [title, description, url]);
}
