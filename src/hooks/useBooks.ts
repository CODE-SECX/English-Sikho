import { useState, useEffect, useCallback } from 'react';
import {
  createBook as createBookApi,
  createBookWords as createBookWordsApi,
  deleteBook as deleteBookApi,
  deleteBookWord as deleteBookWordApi,
  getBookWords,
  getBooks,
  updateBook as updateBookApi,
  updateBookWord as updateBookWordApi,
} from '../lib/database';
import type { Book, BookWord } from '../types';

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [words, setWords] = useState<BookWord[]>([]);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const [bookRows, wordRows] = await Promise.all([getBooks(), getBookWords()]);
      setBooks(bookRows || []);
      setWords(wordRows || []);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addBook = async (book: Pick<Book, 'title' | 'author'>) => {
    const data = await createBookApi(book);
    await refetch();
    return data;
  };

  const updateBook = async (id: string, updates: Pick<Book, 'title' | 'author'>) => {
    await updateBookApi(id, updates);
    await refetch();
  };

  const deleteBook = async (id: string) => {
    await deleteBookApi(id);
    await refetch();
  };

  const addWords = async (
    rows: Pick<BookWord, 'book_id' | 'page' | 'word' | 'meaning' | 'meaning_gujarati'>[],
  ) => {
    const data = await createBookWordsApi(rows);
    await refetch();
    return data;
  };

  const updateWord = async (
    id: string,
    updates: Pick<BookWord, 'page' | 'word' | 'meaning' | 'meaning_gujarati'>,
  ) => {
    await updateBookWordApi(id, updates);
    await refetch();
  };

  const deleteWord = async (id: string) => {
    await deleteBookWordApi(id);
    await refetch();
  };

  return { books, words, loading, addBook, updateBook, deleteBook, addWords, updateWord, deleteWord };
}
