import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop: React.FC<{ behavior?: ScrollBehavior }> = ({
  behavior = "auto",
}) => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior });
  }, [pathname, behavior]);

  return null;
};

export default ScrollToTop;
