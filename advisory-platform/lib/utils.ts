export const cleanText = (text: string) => {
  if (!text) return "";
  return text.replace(/^"+|"+$/g, "").replace(/\s+/g, " ").trim();
};