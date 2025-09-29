import ISO6391 from "iso-639-1";

export function formatSpokenLanguages(langs: string[]): string[] {
  return langs.map((code) => ISO6391.getName(code) || code);
}
