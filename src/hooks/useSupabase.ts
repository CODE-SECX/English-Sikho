import { useState, useEffect } from 'react';
import {
  createCategory as createCategoryApi,
  createSikho as createSikhoApi,
  createVocabulary as createVocabularyApi,
  deleteCategory as deleteCategoryApi,
  deleteSikho as deleteSikhoApi,
  deleteVocabulary as deleteVocabularyApi,
  getCategories,
  getSikho,
  getVocabulary,
  updateCategory as updateCategoryApi,
  updateSikho as updateSikhoApi,
  updateVocabulary as updateVocabularyApi,
} from '../lib/database';
import type { Category, Vocabulary, Sikho } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
    try {
      const data = await createCategoryApi(category);
      await fetchCategories();
      return data;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      await updateCategoryApi(id, updates);
      await fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteCategoryApi(id);
      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories
  };
}

export function useVocabulary() {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVocabulary = async () => {
    try {
      const data = await getVocabulary();
      setVocabulary(data || []);
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVocabulary();
  }, []);

  const addVocabulary = async (vocab: Omit<Vocabulary, 'id' | 'created_at'>) => {
    try {
      const data = await createVocabularyApi(vocab);
      await fetchVocabulary();
      return data;
    } catch (error) {
      console.error('Error adding vocabulary:', error);
      throw error;
    }
  };

  const updateVocabulary = async (id: string, updates: Partial<Vocabulary>) => {
    try {
      await updateVocabularyApi(id, updates);
      await fetchVocabulary();
    } catch (error) {
      console.error('Error updating vocabulary:', error);
      throw error;
    }
  };

  const deleteVocabulary = async (id: string) => {
    try {
      await deleteVocabularyApi(id);
      await fetchVocabulary();
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
      throw error;
    }
  };

  return {
    vocabulary,
    loading,
    addVocabulary,
    updateVocabulary,
    deleteVocabulary,
    refetch: fetchVocabulary
  };
}

export function useSikho() {
  const [sikho, setSikho] = useState<Sikho[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSikho = async () => {
    try {
      const data = await getSikho();
      setSikho(data || []);
    } catch (error) {
      console.error('Error fetching sikho:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSikho();
  }, []);

  const addSikho = async (entry: Omit<Sikho, 'id' | 'created_at' | 'category'>) => {
    try {
      const data = await createSikhoApi(entry);
      await fetchSikho();
      return data;
    } catch (error) {
      console.error('Error adding sikho:', error);
      throw error;
    }
  };

  const updateSikho = async (id: string, updates: Partial<Sikho>) => {
    try {
      await updateSikhoApi(id, updates);
      await fetchSikho();
    } catch (error) {
      console.error('Error updating sikho:', error);
      throw error;
    }
  };

  const deleteSikho = async (id: string) => {
    try {
      await deleteSikhoApi(id);
      await fetchSikho();
    } catch (error) {
      console.error('Error deleting sikho:', error);
      throw error;
    }
  };

  return {
    sikho,
    loading,
    addSikho,
    updateSikho,
    deleteSikho,
    refetch: fetchSikho
  };
}