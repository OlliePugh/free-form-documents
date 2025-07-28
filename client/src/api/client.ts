import axios from 'axios';
import type {
  Notebook,
  Section,
  Page,
  PageComponent,
  CreateNotebookRequest,
  CreateSectionRequest,
  CreatePageRequest,
  CreatePageComponentRequest,
  UpdatePageComponentRequest
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

// Notebooks
export const notebooksApi = {
  getAll: async (): Promise<Notebook[]> => {
    const response = await apiClient.get('/notebooks');
    return response.data;
  },

  getById: async (id: string): Promise<Notebook> => {
    const response = await apiClient.get(`/notebooks/${id}`);
    return response.data;
  },

  create: async (data: CreateNotebookRequest): Promise<Notebook> => {
    const response = await apiClient.post('/notebooks', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateNotebookRequest>): Promise<Notebook> => {
    const response = await apiClient.put(`/notebooks/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/notebooks/${id}`);
  }
};

// Sections
export const sectionsApi = {
  getByNotebook: async (notebookId: string): Promise<Section[]> => {
    const response = await apiClient.get(`/sections/notebook/${notebookId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Section> => {
    const response = await apiClient.get(`/sections/${id}`);
    return response.data;
  },

  create: async (data: CreateSectionRequest): Promise<Section> => {
    const response = await apiClient.post('/sections', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateSectionRequest>): Promise<Section> => {
    const response = await apiClient.put(`/sections/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/sections/${id}`);
  }
};

// Pages
export const pagesApi = {
  getBySection: async (sectionId: string): Promise<Page[]> => {
    const response = await apiClient.get(`/pages/section/${sectionId}`);
    return response.data;
  },

  getById: async (id: string): Promise<Page> => {
    const response = await apiClient.get(`/pages/${id}`);
    return response.data;
  },

  create: async (data: CreatePageRequest): Promise<Page> => {
    const response = await apiClient.post('/pages', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreatePageRequest>): Promise<Page> => {
    const response = await apiClient.put(`/pages/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/pages/${id}`);
  }
};

// Page Components
export const componentsApi = {
  getByPage: async (pageId: string): Promise<PageComponent[]> => {
    const response = await apiClient.get(`/components/page/${pageId}`);
    return response.data;
  },

  getById: async (id: string): Promise<PageComponent> => {
    const response = await apiClient.get(`/components/${id}`);
    return response.data;
  },

  create: async (data: CreatePageComponentRequest): Promise<PageComponent> => {
    const response = await apiClient.post('/components', data);
    return response.data;
  },

  uploadImage: async (file: File, options: { pageId: string; x: number; y: number; width: number; height: number; zIndex?: number }): Promise<PageComponent> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('pageId', options.pageId);
    formData.append('x', options.x.toString());
    formData.append('y', options.y.toString());
    formData.append('width', options.width.toString());
    formData.append('height', options.height.toString());
    if (options.zIndex !== undefined) {
      formData.append('zIndex', options.zIndex.toString());
    }

    const response = await apiClient.post('/components/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, data: UpdatePageComponentRequest): Promise<PageComponent> => {
    const response = await apiClient.put(`/components/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/components/${id}`);
  },

  getImageUrl: (id: string): string => {
    return `${API_BASE_URL}/api/components/image/${id}`;
  }
};

export default {
  notebooks: notebooksApi,
  sections: sectionsApi,
  pages: pagesApi,
  components: componentsApi
};