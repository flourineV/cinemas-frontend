//Format Title
export const formatTitle = (title: string) => {
  if (!title) return "";
  return title.replace(":", ":\n");
};

//Format Genres
export function formatGenres(genres: string[]): string {
  return genres
    .map((g) => g.replace(/^Phim\s*/i, "")) // bỏ chữ "Phim"
    .filter((value, index, self) => self.indexOf(value) === index) // bỏ trùng
    .join(", ");
}

//Format Spoken Language
import ISO6391 from "iso-639-1";

export function formatSpokenLanguages(langs: string[]): string[] {
  return langs.map((code) => ISO6391.getName(code) || code);
}


