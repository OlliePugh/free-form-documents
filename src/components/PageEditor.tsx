import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Type, Image, Circle, Wifi, WifiOff } from 'lucide-react';
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
      {/* Quick Actions Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleAddTextComponent}
              className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Type className="w-4 h-4 mr-2" />
              Add Text
            </button>
            <button
              onClick={handleAddImageComponent}
              className="flex items-center px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Image className="w-4 h-4 mr-2" />
              Add Image
            </button>
            <button
              onClick={() => addComponent('DRAWING', 200, 200, 150, 150)}
              className="flex items-center px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Circle className="w-4 h-4 mr-2" />
              Add Drawing
            </button>
          </div>

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