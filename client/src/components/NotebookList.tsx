import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen } from 'lucide-react';
import { notebooksApi } from '../api/client';
import { Notebook } from '../types';

export function NotebookList() {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotebooks();
  }, []);

  const loadNotebooks = async () => {
    try {
      const data = await notebooksApi.getAll();
      setNotebooks(data);
    } catch (error) {
      console.error('Failed to load notebooks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Welcome Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to OneNote</h1>
          <p className="text-xl text-gray-600 mb-8">
            Organize your thoughts, capture ideas, and collaborate with others.
          </p>
        </div>

        {/* Notebooks Grid */}
        {notebooks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="mx-auto h-20 w-20 text-gray-400 mb-6" />
            <h3 className="text-2xl font-medium text-gray-900 mb-3">No notebooks yet</h3>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Create your first notebook to start taking notes and organizing your ideas.
            </p>
            <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg">
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Notebook
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Your Notebooks</h2>
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4 mr-2" />
                New Notebook
              </button>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {notebooks.map((notebook) => (
                <Link
                  key={notebook.id}
                  to={`/notebook/${notebook.id}`}
                  className="group relative bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                >
                  <div className="flex items-start space-x-4">
                    <div 
                      className="w-6 h-6 rounded flex-shrink-0"
                      style={{ backgroundColor: notebook.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-700">
                        {notebook.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {notebook.sections?.length || 0} sections
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        Created {new Date(notebook.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {/* Quick stats */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        {notebook.sections?.reduce((acc, section) => acc + (section.pages?.length || 0), 0) || 0} pages
                      </span>
                      <span>
                        Updated {new Date(notebook.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
              
              {/* Add Notebook Button */}
              <button className="group relative bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-center">
                <div className="flex flex-col items-center justify-center h-full">
                  <Plus className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mb-3" />
                  <span className="text-lg font-medium text-gray-500 group-hover:text-blue-600">
                    Add Notebook
                  </span>
                  <span className="text-sm text-gray-400 group-hover:text-blue-500 mt-1">
                    Create a new notebook
                  </span>
                </div>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}