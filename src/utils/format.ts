export const formatTitle = (title: string) => {
  if (!title) return "";
  return title.replace(":", ":\n");
};