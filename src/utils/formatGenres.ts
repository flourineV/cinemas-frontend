export function formatGenres(genres: string[]): string {
  return genres
    .map((g) => g.replace(/^Phim\s*/i, "")) // bỏ chữ "Phim"
    .filter((value, index, self) => self.indexOf(value) === index) // bỏ trùng
    .join(", ");
}
