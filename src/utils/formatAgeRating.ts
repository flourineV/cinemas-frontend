/**
 * Format age rating from number to Vietnamese description
 * @param age - Age rating number (e.g., 0, 13, 16, 18)
 * @returns Formatted age rating string
 */
export const formatAgeRating = (age: number | string): string => {
  const ageNum = typeof age === "string" ? parseInt(age) : age;

  switch (ageNum) {
    case 0:
      return "Phim dành cho khán giả mọi lứa tuổi";
    case 13:
      return "Phim dành cho khán giả từ đủ 13 tuổi trở lên (13+)";
    case 16:
      return "Phim dành cho khán giả từ đủ 16 tuổi trở lên (16+)";
    case 18:
      return "Phim dành cho khán giả từ đủ 18 tuổi trở lên (18+)";
    default:
      return `Phim dành cho khán giả từ đủ ${ageNum} tuổi trở lên`;
  }
};

/**
 * Get short age rating label
 * @param age - Age rating number
 * @returns Short label (e.g., "P", "T13", "T16", "T18")
 */
export const getAgeRatingLabel = (age: number | string): string => {
  const ageNum = typeof age === "string" ? parseInt(age) : age;
  return ageNum === 0 ? "P" : `T${ageNum}`;
};
