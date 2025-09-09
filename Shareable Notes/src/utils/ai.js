
export async function summarizeNote(html) {

  const txt = stripHtml(html).trim();
  if (!txt) return "";
  const s = txt.split(/\n|\./).find(Boolean) || txt;
  return s.trim().slice(0, 140) + (s.length > 140 ? "…" : "");
}

export function suggestTagsFromText(html) {
  const txt = stripHtml(html).toLowerCase();
  const words = txt.match(/\b[a-z]{4,}\b/g) || [];
  // count frequency
  const freq = {};
  for (const w of words) freq[w] = (freq[w] || 0) + 1;
  const top = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map((x) => x[0]);
  return top;
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, " ");
}
