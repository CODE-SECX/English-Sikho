import type { Book, BookWord, Category, Sikho, Vocabulary } from '../types';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getCategories(): Promise<Category[]> {
  return request<Category[]>('/categories');
}

export async function createCategory(category: Omit<Category, 'id' | 'created_at'>): Promise<Category> {
  return request<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify(category),
  });
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<Category> {
  return request<Category>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  return request<void>(`/categories/${id}`, {
    method: 'DELETE',
  });
}

export async function getVocabulary(): Promise<Vocabulary[]> {
  return request<Vocabulary[]>('/vocabulary');
}

export async function createVocabulary(vocab: Omit<Vocabulary, 'id' | 'created_at'>): Promise<Vocabulary> {
  return request<Vocabulary>('/vocabulary', {
    method: 'POST',
    body: JSON.stringify(vocab),
  });
}

export async function updateVocabulary(id: string, updates: Partial<Vocabulary>): Promise<Vocabulary> {
  return request<Vocabulary>(`/vocabulary/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteVocabulary(id: string): Promise<void> {
  return request<void>(`/vocabulary/${id}`, {
    method: 'DELETE',
  });
}

export async function getSikho(): Promise<Sikho[]> {
  return request<Sikho[]>('/sikho');
}

export async function createSikho(entry: Omit<Sikho, 'id' | 'created_at' | 'category'>): Promise<Sikho> {
  return request<Sikho>('/sikho', {
    method: 'POST',
    body: JSON.stringify(entry),
  });
}

export async function updateSikho(id: string, updates: Partial<Sikho>): Promise<Sikho> {
  return request<Sikho>(`/sikho/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteSikho(id: string): Promise<void> {
  return request<void>(`/sikho/${id}`, {
    method: 'DELETE',
  });
}

export async function getBooks(): Promise<Book[]> {
  return request<Book[]>('/books');
}

export async function createBook(book: Pick<Book, 'title' | 'author'>): Promise<Book> {
  return request<Book>('/books', {
    method: 'POST',
    body: JSON.stringify(book),
  });
}

export async function updateBook(id: string, updates: Pick<Book, 'title' | 'author'>): Promise<Book> {
  return request<Book>(`/books/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteBook(id: string): Promise<void> {
  return request<void>(`/books/${id}`, {
    method: 'DELETE',
  });
}

export async function getBookWords(): Promise<BookWord[]> {
  return request<BookWord[]>('/book-words');
}

export async function createBookWords(
  words: Pick<BookWord, 'book_id' | 'page' | 'word' | 'meaning' | 'meaning_gujarati'>[],
): Promise<BookWord[]> {
  return request<BookWord[]>('/book-words', {
    method: 'POST',
    body: JSON.stringify(words),
  });
}

export async function updateBookWord(
  id: string,
  updates: Pick<BookWord, 'page' | 'word' | 'meaning' | 'meaning_gujarati'>,
): Promise<BookWord> {
  return request<BookWord>(`/book-words/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteBookWord(id: string): Promise<void> {
  return request<void>(`/book-words/${id}`, {
    method: 'DELETE',
  });
}
