import { useState, ReactNode } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  FileText, 
  ChevronRight, 
  ChevronDown,
  Plus,
  Settings,
  Search,
  Menu,
  X
} from 'lucide-react';
import { Notebook, Section, Page } from '../types';

interface OneNoteLayoutProps {
  children: ReactNode;
  notebooks?: Notebook[];
  currentNotebook?: Notebook | null;
  currentPage?: Page | null;
  onCreateNotebook?: () => void;
  onCreateSection?: () => void;
  onCreatePage?: () => void;
}

export function OneNoteLayout({
  children,
  notebooks = [],
  currentNotebook,
  currentPage,
  onCreateNotebook,
  onCreateSection,
  onCreatePage
}: OneNoteLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set());
  const { notebookId, pageId } = useParams();
  const location = useLocation();

  const toggleNotebook = (notebookId: string) => {
    const newExpanded = new Set(expandedNotebooks);
    if (newExpanded.has(notebookId)) {
      newExpanded.delete(notebookId);
    } else {
      newExpanded.add(notebookId);
    }
    setExpandedNotebooks(newExpanded);
  };

  const isNotebookPage = location.pathname.includes('/notebook/');
  const isPageEditor = location.pathname.includes('/page/');

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-0' : 'w-80'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col`}>
        {!sidebarCollapsed && (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-lg font-semibold text-gray-900">OneNote</h1>
                <button
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1 rounded hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search notebooks..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-2">
                {/* Notebooks */}
                <div className="mb-4">
                  <div className="flex items-center justify-between px-2 py-1 mb-2">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Notebooks</h3>
                    <button
                      onClick={onCreateNotebook}
                      className="p-1 rounded hover:bg-gray-100"
                      title="Create new notebook"
                    >
                      <Plus className="w-3 h-3 text-gray-400" />
                    </button>
                  </div>
                  
                  {notebooks.map((notebook) => {
                    const isExpanded = expandedNotebooks.has(notebook.id);
                    const isActive = notebookId === notebook.id;
                    
                    return (
                      <div key={notebook.id} className="mb-1">
                        {/* Notebook Header */}
                        <div
                          className={`flex items-center px-2 py-2 rounded-md cursor-pointer transition-colors ${
                            isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-100'
                          }`}
                        >
                          <button
                            onClick={() => toggleNotebook(notebook.id)}
                            className="flex items-center flex-1 min-w-0"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 mr-2 flex-shrink-0" />
                            ) : (
                              <ChevronRight className="w-4 h-4 mr-2 flex-shrink-0" />
                            )}
                            <div
                              className="w-3 h-3 rounded mr-2 flex-shrink-0"
                              style={{ backgroundColor: notebook.color }}
                            />
                            <span className="text-sm font-medium truncate">{notebook.title}</span>
                          </button>
                          <Link
                            to={`/notebook/${notebook.id}`}
                            className="p-1 rounded hover:bg-gray-200"
                            title="Open notebook"
                          >
                            <BookOpen className="w-3 h-3" />
                          </Link>
                        </div>

                        {/* Sections */}
                        {isExpanded && notebook.sections && (
                          <div className="ml-6 mt-1 space-y-1">
                            {notebook.sections.map((section) => (
                              <div key={section.id}>
                                <div className="flex items-center justify-between px-2 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded">
                                  <span className="truncate">{section.title}</span>
                                  <button
                                    onClick={() => onCreatePage?.()}
                                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200"
                                    title="Add page"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                                
                                {/* Pages */}
                                {section.pages && section.pages.length > 0 && (
                                  <div className="ml-4 space-y-1">
                                    {section.pages.map((page) => {
                                      const isPageActive = pageId === page.id;
                                      return (
                                        <Link
                                          key={page.id}
                                          to={`/page/${page.id}`}
                                          className={`flex items-center px-2 py-1 text-sm rounded transition-colors ${
                                            isPageActive 
                                              ? 'bg-blue-100 text-blue-700 font-medium'
                                              : 'text-gray-600 hover:bg-gray-50'
                                          }`}
                                        >
                                          <FileText className="w-3 h-3 mr-2 flex-shrink-0" />
                                          <span className="truncate">{page.title}</span>
                                        </Link>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ))}
                            
                            {/* Add Section Button */}
                            <button
                              onClick={onCreateSection}
                              className="flex items-center px-2 py-1 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded w-full"
                            >
                              <Plus className="w-3 h-3 mr-2" />
                              Add section
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <button className="flex items-center text-sm text-gray-600 hover:text-gray-900">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
            </div>
          </>
        )}
      </div>

      {/* Collapsed Sidebar Button */}
      {sidebarCollapsed && (
        <div className="w-12 bg-white border-r border-gray-200 flex flex-col items-center py-4">
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="p-2 rounded hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!sidebarCollapsed && currentPage && (
                <nav className="flex items-center space-x-2 text-sm text-gray-500">
                  <Link
                    to={`/notebook/${currentPage.section.notebookId}`}
                    className="hover:text-gray-700"
                  >
                    {currentPage.section.notebook.title}
                  </Link>
                  <ChevronRight className="w-4 h-4" />
                  <span>{currentPage.section.title}</span>
                  <ChevronRight className="w-4 h-4" />
                  <span className="text-gray-900 font-medium">{currentPage.title}</span>
                </nav>
              )}
              
              {isNotebookPage && currentNotebook && !isPageEditor && (
                <h1 className="text-xl font-semibold text-gray-900">{currentNotebook.title}</h1>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {isPageEditor && (
                <>
                  <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    Share
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    More
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}