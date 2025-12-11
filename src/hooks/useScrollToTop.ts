import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Hook to scroll to top of the page when route changes
 * @param scrollToElement - Optional selector to scroll to specific element instead of top
 * @param behavior - Scroll behavior ('smooth' | 'auto')
 */
export const useScrollToTop = (
  scrollToElement?: string,
  behavior: ScrollBehavior = "smooth"
) => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (scrollToElement) {
      const element = document.querySelector(scrollToElement);
      if (element) {
        element.scrollIntoView({ behavior, block: "start" });
      }
    } else {
      window.scrollTo({ top: 0, behavior });
    }
  }, [pathname, scrollToElement, behavior]);
};

/**
 * Hook to scroll to a specific element
 * @param elementSelector - CSS selector for the element to scroll to
 * @param behavior - Scroll behavior ('smooth' | 'auto')
 */
export const useScrollToElement = () => {
  const scrollToElement = (
    elementSelector: string,
    behavior: ScrollBehavior = "smooth"
  ) => {
    const element = document.querySelector(elementSelector);
    if (element) {
      element.scrollIntoView({ behavior, block: "start" });
    }
  };

  return scrollToElement;
};
