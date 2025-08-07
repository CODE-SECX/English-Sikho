import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Category, Vocabulary, Sikho } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
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
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();
      
      if (error) throw error;
      await fetchCategories();
      return data;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      await fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
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
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
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
      const { data, error } = await supabase
        .from('vocabulary')
        .insert([vocab])
        .select()
        .single();
      
      if (error) throw error;
      await fetchVocabulary();
      return data;
    } catch (error) {
      console.error('Error adding vocabulary:', error);
      throw error;
    }
  };

  const updateVocabulary = async (id: string, updates: Partial<Vocabulary>) => {
    try {
      const { error } = await supabase
        .from('vocabulary')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      await fetchVocabulary();
    } catch (error) {
      console.error('Error updating vocabulary:', error);
      throw error;
    }
  };

  const deleteVocabulary = async (id: string) => {
    try {
      const { error } = await supabase
        .from('vocabulary')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
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
      const { data, error } = await supabase
        .from('sikho')
        .select(`
          *,
          category:categories(*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
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
      const { data, error } = await supabase
        .from('sikho')
        .insert([entry])
        .select()
        .single();
      
      if (error) throw error;
      await fetchSikho();
      return data;
    } catch (error) {
      console.error('Error adding sikho:', error);
      throw error;
    }
  };

  const updateSikho = async (id: string, updates: Partial<Sikho>) => {
    try {
      const { error } = await supabase
        .from('sikho')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      await fetchSikho();
    } catch (error) {
      console.error('Error updating sikho:', error);
      throw error;
    }
  };

  const deleteSikho = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sikho')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
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