import { useLanguage } from "../contexts/LanguageContext";

export type Language = "vi" | "en";

export const useTranslation = () => {
  const { language, setLanguage, t } = useLanguage();

  return { language, setLanguage, t };
};
