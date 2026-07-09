// Fetches today's NYT Connections puzzle and saves a simplified copy to public/today.json
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '..', 'public', 'today.json');

// NYT's puzzle day rolls over at midnight US Eastern, not UTC.
function todaysDateString() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const lookup = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${lookup.year}-${lookup.month}-${lookup.day}`;
}

async function fetchPuzzle(dateString) {
  const url = `https://www.nytimes.com/svc/connections/v2/${dateString}.json`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} fetching ${url}`);
  }

  return response.json();
}

// NYT returns categories already ordered easiest (yellow) to hardest (purple).
function toHintFormat(puzzle) {
  return {
    date: puzzle.print_date,
    editor: puzzle.editor,
    categories: puzzle.categories.map((category, index) => ({
      title: category.title,
      level: index + 1,
      words: category.cards.map((card) => card.content),
    })),
  };
}

async function main() {
  const dateString = todaysDateString();
  const puzzle = await fetchPuzzle(dateString);
  const hintData = toHintFormat(puzzle);

  await writeFile(outPath, JSON.stringify(hintData, null, 2) + '\n');
  console.log(`Saved ${dateString} puzzle to ${outPath}`);
}

main().catch((error) => {
  console.error('Failed to fetch Connections puzzle:', error);
  process.exit(1);
});
