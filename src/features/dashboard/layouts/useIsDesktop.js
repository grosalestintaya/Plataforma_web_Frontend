import { useEffect, useState } from "react";

export default function useIsDesktop(breakpoint = 768) {
  const getValue = () =>
    typeof window !== "undefined" ? window.innerWidth >= breakpoint : false;

  const [isDesktop, setIsDesktop] = useState(getValue);

  useEffect(() => {
    const onResize = () => setIsDesktop(getValue());

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isDesktop;
}