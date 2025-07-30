import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Notebook, Page } from '../types';
import { notebooksApi, pagesApi } from '../api/client';

export function useAppData() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [currentNotebook, setCurrentNotebook] = useState<Notebook | null>(null);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const { notebookId, pageId } = useParams();

  // Load all notebooks
  const loadNotebooks = async () => {
    try {
      const data = await notebooksApi.getAll();
      setNotebooks(data);
    } catch (error) {
      console.error('Failed to load notebooks:', error);
    }
  };

  // Load current notebook
  const loadCurrentNotebook = async (id: string) => {
    try {
      const data = await notebooksApi.getById(id);
      setCurrentNotebook(data);
    } catch (error) {
      console.error('Failed to load current notebook:', error);
      setCurrentNotebook(null);
    }
  };

  // Load current page
  const loadCurrentPage = async (id: string) => {
    try {
      const data = await pagesApi.getById(id);
      setCurrentPage(data);
      // Also set the current notebook from the page data
      if (data.section.notebook) {
        setCurrentNotebook(data.section.notebook);
      }
    } catch (error) {
      console.error('Failed to load current page:', error);
      setCurrentPage(null);
    }
  };

  // Load notebooks on mount
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await loadNotebooks();
      setLoading(false);
    };
    initializeData();
  }, []);

  // Load current notebook when notebookId changes
  useEffect(() => {
    if (notebookId && !pageId) {
      loadCurrentNotebook(notebookId);
      setCurrentPage(null);
    } else if (!notebookId && !pageId) {
      setCurrentNotebook(null);
      setCurrentPage(null);
    }
  }, [notebookId, pageId]);

  // Load current page when pageId changes
  useEffect(() => {
    if (pageId) {
      loadCurrentPage(pageId);
    } else {
      setCurrentPage(null);
    }
  }, [pageId]);

  const refreshNotebooks = () => {
    loadNotebooks();
  };

  const refreshCurrentNotebook = () => {
    if (notebookId) {
      loadCurrentNotebook(notebookId);
    }
  };

  return {
    notebooks,
    currentNotebook,
    currentPage,
    loading,
    refreshNotebooks,
    refreshCurrentNotebook,
    loadNotebooks,
    loadCurrentNotebook,
    loadCurrentPage
  };
}