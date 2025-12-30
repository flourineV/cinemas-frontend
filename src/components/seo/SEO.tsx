import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "movie";
  locale?: string;
  noIndex?: boolean;
}

const DEFAULT_TITLE = "CineHub - Hệ thống đặt vé xem phim trực tuyến";
const DEFAULT_DESCRIPTION =
  "CineHub - Hệ thống rạp chiếu phim hiện đại. Đặt vé xem phim online, xem lịch chiếu, phim đang chiếu, phim sắp chiếu tại các rạp trên toàn quốc.";
const DEFAULT_KEYWORDS =
  "đặt vé xem phim, rạp chiếu phim, phim đang chiếu, phim sắp chiếu, lịch chiếu phim, cinehub, cinema, movie tickets, book movie tickets";
const DEFAULT_IMAGE = "/LogoFullfinal.png";
const SITE_NAME = "CineHub";

export const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  locale = "vi_VN",
  noIndex = false,
}: SEOProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const currentUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");
  const fullImage = image.startsWith("http")
    ? image
    : `${typeof window !== "undefined" ? window.location.origin : ""}${image}`;

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Helper to update or create meta tag
    const updateMeta = (name: string, content: string, isProperty = false) => {
      const attr = isProperty ? "property" : "name";
      let meta = document.querySelector(
        `meta[${attr}="${name}"]`
      ) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic meta tags
    updateMeta("description", description);
    updateMeta("keywords", keywords);
    updateMeta("author", SITE_NAME);

    // Robots
    if (noIndex) {
      updateMeta("robots", "noindex, nofollow");
    } else {
      updateMeta(
        "robots",
        "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      );
    }

    // Open Graph tags
    updateMeta("og:title", fullTitle, true);
    updateMeta("og:description", description, true);
    updateMeta("og:image", fullImage, true);
    updateMeta("og:url", currentUrl, true);
    updateMeta("og:type", type, true);
    updateMeta("og:site_name", SITE_NAME, true);
    updateMeta("og:locale", locale, true);

    // Twitter Card tags
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", fullTitle);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", fullImage);

    // Cleanup function
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [
    fullTitle,
    description,
    keywords,
    fullImage,
    currentUrl,
    type,
    locale,
    noIndex,
  ]);

  return null;
};

export default SEO;
