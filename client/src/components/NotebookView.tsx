import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plus, FileText, FolderOpen } from 'lucide-react';
import { notebooksApi, sectionsApi, pagesApi } from '../api/client';
import { Notebook } from '../types';

export function NotebookView() {
  const { notebookId } = useParams<{ notebookId: string }>();
  const [notebook, setNotebook] = useState<Notebook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (notebookId) {
      loadNotebook();
    }
  }, [notebookId]);

  const loadNotebook = async () => {
    try {
      const data = await notebooksApi.getById(notebookId!);
      setNotebook(data);
    } catch (error) {
      console.error('Failed to load notebook:', error);
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

  if (!notebook) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Notebook not found</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-500 mt-2 inline-block">
            ← Back to notebooks
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Notebook Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div
              className="w-8 h-8 rounded mr-4"
              style={{ backgroundColor: notebook.color }}
            />
            <h1 className="text-3xl font-bold text-gray-900">{notebook.title}</h1>
          </div>
          <p className="text-gray-600">
            {notebook.sections?.length || 0} sections • Created {new Date(notebook.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Sections Grid */}
        {notebook.sections?.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No sections yet</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first section.</p>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Create Section
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {notebook.sections?.map((section) => (
              <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                    <div className="text-sm text-gray-500">
                      {section.pages?.length || 0} pages
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  {section.pages?.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                      <p className="text-gray-500 mb-4">No pages in this section</p>
                      <button className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Page
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {section.pages?.map((page) => (
                        <Link
                          key={page.id}
                          to={`/page/${page.id}`}
                          className="group block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start space-x-3">
                            <FileText className="w-5 h-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate group-hover:text-blue-700">
                                {page.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {page.components?.length || 0} components
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(page.updatedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                      
                      {/* Add Page Button */}
                      <button className="group block p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-center">
                        <div className="flex flex-col items-center justify-center h-full">
                          <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-500 mb-2" />
                          <span className="text-sm text-gray-500 group-hover:text-blue-600">Add Page</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}