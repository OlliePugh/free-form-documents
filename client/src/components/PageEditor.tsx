import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Type, Image, Circle, Wifi, WifiOff, Bold, Italic, Underline, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Table, Plus, Minus, Merge, Split, Trash2 } from 'lucide-react';
import { useEditorContext } from '../contexts/EditorContext';
import { useCollaboration } from '../hooks/useCollaboration';
import { PageComponent } from './PageComponent';
import { pagesApi, componentsApi } from '../api/client';
import { Page } from '../types';

export function PageEditor() {
  const { pageId } = useParams<{ pageId: string }>();
  const [page, setPage] = useState<Page | null>(null);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    activeEditor, 
    toggleBold, 
    toggleItalic, 
    toggleUnderline, 
    toggleBulletList, 
    toggleOrderedList, 
    setTextAlign,
    insertTable,
    addColumnBefore,
    addColumnAfter,
    deleteColumn,
    addRowBefore,
    addRowAfter,
    deleteRow,
    mergeCells,
    splitCell,
    deleteTable,
    isActive,
    canExecute
  } = useEditorContext();

  const {
    components,
    isConnected,
    addComponent,
    updateComponent,
    deleteComponent,
    getComponentText,
    bringToFront,
    sendToBack
  } = useCollaboration(pageId!);

  useEffect(() => {
    loadPage();
  }, [pageId]);

  const loadPage = async () => {
    if (!pageId) return;

    try {
      console.log(`📄 Loading page data for: ${pageId}`);
      const pageData = await pagesApi.getById(pageId);
      setPage(pageData);
      console.log(`📄 Page loaded: ${pageData.title}`);
    } catch (error) {
      console.error('Error loading page:', error);
    }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      setSelectedComponentId(null);
    }
  };

  const handleAddTextComponent = () => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = 100;
    const y = 100;

    const componentId = addComponent('TEXT', x, y, 400, 200, {
      text: 'Start typing your notes here...'
    });

    if (componentId) {
      setSelectedComponentId(componentId);
      console.log(`✨ Created text component: ${componentId}`);
    }
  };

  const handleAddImageComponent = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pageId) return;

    try {
      console.log(`📸 Uploading image: ${file.name}`);

      // Upload the image
      const component = await componentsApi.uploadImage(file, {
        pageId,
        x: 150,
        y: 150,
        width: 200,
        height: 150
      });

      // Add the component to Yjs with hasImage flag
      const componentId = addComponent('IMAGE', component.x, component.y, component.width, component.height, {
        hasImage: true
      });

      if (componentId) {
        setSelectedComponentId(componentId);
        console.log(`✨ Created image component: ${componentId}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }

    // Reset the file input
    e.target.value = '';
  };

  const handleComponentUpdate = (componentId: string, updates: any) => {
    updateComponent(componentId, updates);
  };

  const handleComponentDelete = (componentId: string) => {
    deleteComponent(componentId);
    if (selectedComponentId === componentId) {
      setSelectedComponentId(null);
    }
  };

  const handleComponentSelect = (componentId: string) => {
    setSelectedComponentId(componentId);
  };

  // Debug: Log components when they change
  useEffect(() => {
    console.log(`🔄 Components updated: ${components.size} total`, Array.from(components.keys()));
  }, [components]);

  if (!page) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">Loading page...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Global Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Insert Tools */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleAddTextComponent}
              className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Type className="w-4 h-4 mr-2" />
              Add Text
            </button>
            <button
              onClick={handleAddImageComponent}
              className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Image className="w-4 h-4 mr-2" />
              Add Image
            </button>
            <button
              onClick={() => addComponent('DRAWING', 200, 200, 150, 150)}
              className="flex items-center px-3 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Circle className="w-4 h-4 mr-2" />
              Add Drawing
            </button>
          </div>

          {/* Formatting Tools */}
          <div className="flex items-center space-x-1 border-l border-gray-300 pl-4">
            <div className="text-sm text-gray-500 mr-3">
              {activeEditor ? 'Format selected text:' : 'Click in text to format:'}
            </div>
            <button 
              className={`p-2 rounded hover:bg-gray-100 disabled:opacity-50 ${isActive('bold') ? 'bg-blue-100 text-blue-600' : ''}`}
              disabled={!activeEditor} 
              onClick={toggleBold}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button 
              className={`p-2 rounded hover:bg-gray-100 disabled:opacity-50 ${isActive('italic') ? 'bg-blue-100 text-blue-600' : ''}`}
              disabled={!activeEditor} 
              onClick={toggleItalic}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button 
              className={`p-2 rounded hover:bg-gray-100 disabled:opacity-50 ${isActive('underline') ? 'bg-blue-100 text-blue-600' : ''}`}
              disabled={!activeEditor} 
              onClick={toggleUnderline}
              title="Underline (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button 
              className={`p-2 rounded hover:bg-gray-100 disabled:opacity-50 ${isActive('bulletList') ? 'bg-blue-100 text-blue-600' : ''}`}
              disabled={!activeEditor} 
              onClick={toggleBulletList}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              className={`p-2 rounded hover:bg-gray-100 disabled:opacity-50 ${isActive('orderedList') ? 'bg-blue-100 text-blue-600' : ''}`}
              disabled={!activeEditor} 
              onClick={toggleOrderedList}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button 
              className={`p-2 rounded hover:bg-gray-100 disabled:opacity-50 ${isActive('textAlign', { textAlign: 'left' }) ? 'bg-blue-100 text-blue-600' : ''}`}
              disabled={!activeEditor} 
              onClick={() => setTextAlign('left')}
              title="Align Left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button 
              className={`p-2 rounded hover:bg-gray-100 disabled:opacity-50 ${isActive('textAlign', { textAlign: 'center' }) ? 'bg-blue-100 text-blue-600' : ''}`}
              disabled={!activeEditor} 
              onClick={() => setTextAlign('center')}
              title="Align Center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button 
              className={`p-2 rounded hover:bg-gray-100 disabled:opacity-50 ${isActive('textAlign', { textAlign: 'right' }) ? 'bg-blue-100 text-blue-600' : ''}`}
              disabled={!activeEditor} 
              onClick={() => setTextAlign('right')}
              title="Align Right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <button 
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
              disabled={!activeEditor} 
              onClick={insertTable}
              title="Insert Table (3x3)"
            >
              <Table className="w-4 h-4" />
            </button>
          </div>

          {/* Table Tools - Show when cursor is in a table */}
          {activeEditor && isActive('table') && (
            <div className="flex items-center space-x-1 border-l border-gray-300 pl-4">
              <div className="text-sm text-gray-500 mr-3">Table:</div>
              <button 
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={!canExecute('addColumnBefore')} 
                onClick={addColumnBefore}
                title="Add Column Before"
              >
                <Plus className="w-4 h-4" />
                <span className="text-xs ml-1">Col</span>
              </button>
              <button 
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={!canExecute('addRowBefore')} 
                onClick={addRowBefore}
                title="Add Row Before"
              >
                <Plus className="w-4 h-4" />
                <span className="text-xs ml-1">Row</span>
              </button>
              <button 
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={!canExecute('deleteColumn')} 
                onClick={deleteColumn}
                title="Delete Column"
              >
                <Minus className="w-4 h-4" />
                <span className="text-xs ml-1">Col</span>
              </button>
              <button 
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={!canExecute('deleteRow')} 
                onClick={deleteRow}
                title="Delete Row"
              >
                <Minus className="w-4 h-4" />
                <span className="text-xs ml-1">Row</span>
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <button 
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={!canExecute('mergeCells')} 
                onClick={mergeCells}
                title="Merge Cells"
              >
                <Merge className="w-4 h-4" />
              </button>
              <button 
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={!canExecute('splitCell')} 
                onClick={splitCell}
                title="Split Cell"
              >
                <Split className="w-4 h-4" />
              </button>
              <button 
                className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
                disabled={!canExecute('deleteTable')} 
                onClick={deleteTable}
                title="Delete Table"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Connection Status & Info */}
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              {components.size} components
            </div>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <div className="flex items-center text-green-600">
                  <Wifi className="w-4 h-4 mr-1" />
                  <span className="text-sm">Connected</span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <WifiOff className="w-4 h-4 mr-1" />
                  <span className="text-sm">Disconnected</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto bg-white">
        <div
          ref={canvasRef}
          className="relative min-h-full"
          onClick={handleCanvasClick}
          style={{ minWidth: '1200px', minHeight: '800px' }}
        >
          {/* Background grid (optional, like OneNote) */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Components */}
          {Array.from(components.values())
            .sort((a, b) => a.zIndex - b.zIndex)
            .map((component) => (
              <PageComponent
                key={component.id}
                component={component}
                isSelected={selectedComponentId === component.id}
                onSelect={() => handleComponentSelect(component.id)}
                onUpdate={(updates) => handleComponentUpdate(component.id, updates)}
                onDelete={() => handleComponentDelete(component.id)}
                getComponentText={() => getComponentText(component.id)}
              />
            ))}

          {/* Welcome message when no components */}
          {components.size === 0 && (
            <div className="absolute top-20 left-20 text-gray-400 pointer-events-none">
              <div className="text-lg font-medium mb-2">Welcome to your new page!</div>
              <div className="text-sm">
                Click "Add Text" to start typing your notes, or add images and drawings.
              </div>
            </div>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
    </div>
  );
}