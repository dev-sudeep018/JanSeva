const CATEGORY_RULES = [
  {
    category: "Street Lighting",
    keywords: [
      "streetlight",
      "street light",
      "lamp",
      "dark road",
      "light pole",
      "lighting",
    ],
    reason:
      "The description appears to concern public lighting or a dark public area.",
  },
  {
    category: "Water Supply",
    keywords: ["water", "pipe", "leak", "tap", "pressure", "supply"],
    reason:
      "The description appears to concern water supply, pressure, or a leaking pipe.",
  },
  {
    category: "Sanitation & Waste",
    keywords: [
      "garbage",
      "waste",
      "rubbish",
      "trash",
      "bin",
      "sewage",
      "cleaning",
    ],
    reason:
      "The description appears to concern waste collection or public cleanliness.",
  },
  {
    category: "Roads & Infrastructure",
    keywords: [
      "pothole",
      "road",
      "footpath",
      "drain",
      "bridge",
      "pavement",
      "infrastructure",
    ],
    reason:
      "The description appears to concern a road, drain, footpath, or other public infrastructure.",
  },
  {
    category: "Public Health",
    keywords: [
      "stagnant",
      "mosquito",
      "health",
      "hygiene",
      "contamination",
      "hazard",
    ],
    reason:
      "The description appears to concern public hygiene or an environmental health risk.",
  },
];

export function suggestCategory(input = "") {
  const normalized = String(input)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ");
  if (normalized.trim().length < 5) return null;

  const ranked = CATEGORY_RULES.map((rule) => ({
    ...rule,
    score: rule.keywords.reduce(
      (total, keyword) =>
        total + (normalized.includes(keyword) ? keyword.split(" ").length : 0),
      0,
    ),
  })).sort((a, b) => b.score - a.score);

  if (!ranked[0]?.score) return null;
  return {
    category: ranked[0].category,
    reason: ranked[0].reason,
    confidence: ranked[0].score > 1 ? "strong" : "possible",
  };
}

export function normalizeSavedReferences(value, limit = 20) {
  if (!Array.isArray(value)) return [];
  const normalized = value
    .filter((id) => /^JSV-\d{4}-[A-Z0-9-]+$/i.test(String(id)))
    .map((id) => String(id).toUpperCase());
  return [...new Set(normalized)].slice(0, limit);
}
