import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { OneNoteLayout } from './components/OneNoteLayout';
import { NotebookList } from './components/NotebookList';
import { NotebookView } from './components/NotebookView';
import { PageEditor } from './components/PageEditor';
import { useAppData } from './hooks/useAppData';
import { notebooksApi, sectionsApi, pagesApi } from './api/client';

function AppContent() {
  const { 
    notebooks, 
    currentNotebook, 
    currentPage, 
    loading, 
    refreshNotebooks,
    refreshCurrentNotebook 
  } = useAppData();
  
  const [showCreateNotebookModal, setShowCreateNotebookModal] = useState(false);
  const [showCreateSectionModal, setShowCreateSectionModal] = useState(false);
  const [showCreatePageModal, setShowCreatePageModal] = useState(false);
  const [newNotebookTitle, setNewNotebookTitle] = useState('');
  const [newNotebookColor, setNewNotebookColor] = useState('#4F46E5');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newPageTitle, setNewPageTitle] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');

  const colors = [
    '#4F46E5', '#059669', '#DC2626', '#7C2D12', '#7C3AED', '#C2410C'
  ];

  const handleCreateNotebook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNotebookTitle.trim()) return;

    try {
      await notebooksApi.create({
        title: newNotebookTitle,
        color: newNotebookColor
      });
      setNewNotebookTitle('');
      setNewNotebookColor('#4F46E5');
      setShowCreateNotebookModal(false);
      refreshNotebooks();
    } catch (error) {
      console.error('Failed to create notebook:', error);
    }
  };

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionTitle.trim() || !currentNotebook) return;

    try {
      await sectionsApi.create({
        title: newSectionTitle,
        notebookId: currentNotebook.id
      });
      setNewSectionTitle('');
      setShowCreateSectionModal(false);
      refreshCurrentNotebook();
    } catch (error) {
      console.error('Failed to create section:', error);
    }
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPageTitle.trim() || !selectedSectionId) return;

    try {
      await pagesApi.create({
        title: newPageTitle,
        sectionId: selectedSectionId
      });
      setNewPageTitle('');
      setSelectedSectionId('');
      setShowCreatePageModal(false);
      refreshCurrentNotebook();
    } catch (error) {
      console.error('Failed to create page:', error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading OneNote...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <OneNoteLayout
        notebooks={notebooks}
        currentNotebook={currentNotebook}
        currentPage={currentPage}
        onCreateNotebook={() => setShowCreateNotebookModal(true)}
        onCreateSection={() => setShowCreateSectionModal(true)}
        onCreatePage={() => setShowCreatePageModal(true)}
      >
        <Routes>
          <Route path="/" element={<NotebookList />} />
          <Route path="/notebook/:notebookId" element={<NotebookView />} />
          <Route path="/page/:pageId" element={<PageEditor />} />
        </Routes>
      </OneNoteLayout>

      {/* Create Notebook Modal */}
      {showCreateNotebookModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateNotebookModal(false)} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateNotebook}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Create New Notebook
                  </h3>
                  
                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={newNotebookTitle}
                      onChange={(e) => setNewNotebookTitle(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter notebook title"
                      autoFocus
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex space-x-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewNotebookColor(color)}
                          className={`w-8 h-8 rounded-full border-2 ${
                            newNotebookColor === color ? 'border-gray-900' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateNotebookModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Section Modal */}
      {showCreateSectionModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateSectionModal(false)} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateSection}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Create New Section
                  </h3>
                  
                  <div className="mb-4">
                    <label htmlFor="sectionTitle" className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      id="sectionTitle"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter section title"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateSectionModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Page Modal */}
      {showCreatePageModal && currentNotebook && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreatePageModal(false)} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreatePage}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Create New Page
                  </h3>
                  
                  <div className="mb-4">
                    <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-2">
                      Section
                    </label>
                    <select
                      id="section"
                      value={selectedSectionId}
                      onChange={(e) => setSelectedSectionId(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select a section</option>
                      {currentNotebook.sections?.map((section) => (
                        <option key={section.id} value={section.id}>
                          {section.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="pageTitle" className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      id="pageTitle"
                      value={newPageTitle}
                      onChange={(e) => setNewPageTitle(e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter page title"
                    />
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreatePageModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;