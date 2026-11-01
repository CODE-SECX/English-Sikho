export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
}

export interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  context: string;
  moment_of_memory: string;
  language: string;
  date: string;
  created_at: string;
}

export interface Sikho {
  id: string;
  title: string;
  description: string;
  moment_of_memory: string;
  category_id: string | null;
  language: string;
  date: string;
  created_at: string;
  category?: Category;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  created_at: string;
}

export interface BookWord {
  id: string;
  book_id: string;
  page: number;
  word: string;
  meaning: string;
  meaning_gujarati: string;
  created_at: string;
}
