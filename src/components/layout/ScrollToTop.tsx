import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

interface ScrollToTopProps {
  behavior?: ScrollBehavior;
  scrollToElement?: string; // CSS selector for element to scroll to instead of top
}

const ScrollToTop: React.FC<ScrollToTopProps> = ({
  behavior = "auto",
  scrollToElement,
}) => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if (scrollToElement) {
      const element = document.querySelector(scrollToElement);
      if (element) {
        element.scrollIntoView({ behavior, block: "start" });
      }
    } else {
      window.scrollTo({ top: 0, left: 0, behavior });
    }
  }, [pathname, behavior, scrollToElement]);

  return null;
};

export default ScrollToTop;
