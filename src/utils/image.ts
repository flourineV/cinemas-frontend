const BASE_IMAGE_URL = import.meta.env.VITE_TMDB_IMAGE_URL || "https://image.tmdb.org/t/p/w500";

export const getPosterUrl = (path?: string) => {
  if (!path) return "/LogoIconfinal.png"; 
  return `${BASE_IMAGE_URL}${path}`;
};

