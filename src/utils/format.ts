//Format Title
export const formatTitle = (title: string) => {
  if (!title) return "";
  return title.replace(":", ":\n");
};

//Format Genres
export function formatGenres(genres: string[]): string {
  if (!genres || genres.length === 0) return "";

  const cleanGenres = genres
    .map((g) => g.replace(/^Phim\s*/i, "")) // bỏ chữ "Phim"
    .filter((value, index, self) => self.indexOf(value) === index); // bỏ trùng

  // Limit to 3 genres and add truncation if more
  if (cleanGenres.length <= 3) {
    return cleanGenres.join(", ");
  } else {
    return cleanGenres.slice(0, 3).join(", ") + "...";
  }
}

//Format Spoken Language
import ISO6391 from "iso-639-1";

export function formatSpokenLanguages(langs: string[]): string {
  if (!langs || langs.length === 0) return "";

  // Convert language codes to names
  const languageNames = langs.map((code) => ISO6391.getName(code) || code);

  // Limit to 3 languages and add truncation if more
  if (languageNames.length <= 3) {
    return languageNames.join(", ");
  } else {
    return languageNames.slice(0, 3).join(", ") + "...";
  }
}
