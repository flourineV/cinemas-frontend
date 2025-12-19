/**
 * Format age rating from number to description based on language
 * @param age - Age rating number (e.g., 0, 13, 16, 18)
 * @param language - Language code ('vi' or 'en')
 * @returns Formatted age rating string
 */
export const formatAgeRating = (
  age: number | string | null | undefined,
  language: string = "vi"
): string => {
  // Handle null, undefined, empty string, or invalid values
  if (age === null || age === undefined || age === "") {
    return language === "en" ? "No age restriction" : "Không giới hạn độ tuổi";
  }

  const ageNum = typeof age === "string" ? parseInt(age) : age;

  // Handle NaN or invalid number
  if (isNaN(ageNum)) {
    return language === "en" ? "No age restriction" : "Không giới hạn độ tuổi";
  }

  if (language === "en") {
    switch (ageNum) {
      case 0:
        return "Suitable for all ages";
      case 13:
        return "Suitable for ages 13 and above (13+)";
      case 16:
        return "Suitable for ages 16 and above (16+)";
      case 18:
        return "Suitable for ages 18 and above (18+)";
      default:
        return `Suitable for ages ${ageNum} and above`;
    }
  }

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
