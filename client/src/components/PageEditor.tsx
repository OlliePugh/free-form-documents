import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Type, Image, Circle, Wifi, WifiOff } from 'lucide-react';
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

    const componentId = addComponent('TEXT', x, y, 200, 100, {
      text: 'Click to edit text...'
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
    // Bring selected component to front for better visibility
    // bringToFront(componentId);
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
    <div className="h-full flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to={`/notebook/${page.section.notebookId}`}
              className="text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{page.title}</h1>
              <p className="text-sm text-gray-500">
                {page.section.notebook.title} → {page.section.title}
              </p>
            </div>
          </div>

          {/* Connection Status */}
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

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleAddTextComponent}
            className="flex items-center px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            <Type className="w-4 h-4 mr-2" />
            Add Text
          </button>
          <button
            onClick={handleAddImageComponent}
            className="flex items-center px-3 py-2 text-sm bg-green-500 text-white rounded hover:bg-green-600"
          >
            <Image className="w-4 h-4 mr-2" />
            Add Image
          </button>
          <button
            onClick={() => addComponent('DRAWING', 200, 200, 150, 150)}
            className="flex items-center px-3 py-2 text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            <Circle className="w-4 h-4 mr-2" />
            Add Drawing
          </button>

          {/* Debug info */}
          <div className="ml-auto text-sm text-gray-500">
            Components: {components.size} | Page: {pageId}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto">
        <div
          ref={canvasRef}
          className="relative min-h-full bg-white"
          onClick={handleCanvasClick}
          style={{ minWidth: '1200px', minHeight: '800px' }}
        >
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