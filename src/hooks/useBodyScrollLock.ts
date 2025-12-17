import { useEffect } from "react";

export const useBodyScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (!isLocked) return;

    // Lưu scroll position hiện tại
    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;

    // Lock scroll
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";

    // Cleanup function
    return () => {
      // Restore scroll
      body.style.position = "";
      body.style.top = "";
      body.style.width = "";
      body.style.overflow = "";
      html.style.overflow = "";

      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, [isLocked]);
};
