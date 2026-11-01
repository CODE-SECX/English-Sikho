export interface ParsedWord {
  word: string;
  meaning: string;
  meaning_gujarati: string;
}

export interface ParsedVocab {
  page: number | null;
  words: ParsedWord[];
}

const clean = (cell: string) => cell.replace(/\*\*|__|`/g, '').trim();

/**
 * Parses a vocabulary table pasted from ChatGPT: markdown pipes, tab-separated
 * (copied from the rendered table) or columns separated by 2+ spaces.
 * Columns: word, simple meaning, Gujarati meaning (optional).
 * A "Page 12 — ..." title line, if present, is returned as the page number.
 */
export function parseVocabTable(text: string): ParsedVocab {
  let page: number | null = null;
  const words: ParsedWord[] = [];

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    if (/^[|\s:-]+$/.test(line)) continue; // markdown separator row

    let cells: string[];
    if (line.includes('|')) {
      cells = line.split('|').map(clean);
      if (cells[0] === '') cells.shift();
      if (cells[cells.length - 1] === '') cells.pop();
    } else if (line.includes('\t')) {
      cells = line.split('\t').map(clean);
    } else {
      cells = line.split(/\s{2,}/).map(clean);
    }

    if (cells.length < 2) {
      const match = line.match(/page\s*(\d+)/i);
      if (match && page === null) page = Number(match[1]);
      continue;
    }

    if (/^word$/i.test(cells[0])) continue; // header row
    if (!cells[0]) continue;

    words.push({
      word: cells[0],
      meaning: cells[1] || '',
      meaning_gujarati: cells.slice(2).filter(Boolean).join(' '),
    });
  }

  return { page, words };
}
