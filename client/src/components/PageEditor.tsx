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
  const [loading, setLoading] = useState(true);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    components,
    isConnected,
    addComponent,
    updateComponent,
    deleteComponent,
    getComponentText
  } = useCollaboration(pageId!);

  useEffect(() => {
    if (pageId) {
      loadPage();
    }
  }, [pageId]);

  const loadPage = async () => {
    try {
      const data = await pagesApi.getById(pageId!);
      setPage(data);
    } catch (error) {
      console.error('Failed to load page:', error);
    } finally {
      setLoading(false);
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
    const width = 200;
    const height = 60;

    const componentId = addComponent('TEXT', x, y, width, height, {
      text: 'Click to edit text',
      zIndex: Date.now()
    });

    if (componentId) {
      setSelectedComponentId(componentId);
    }
  };

  const handleAddImageComponent = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pageId) return;

    try {
      const x = 100;
      const y = 100;
      const width = 200;
      const height = 150;
      
      // Upload image to backend first
      const uploadedComponent = await componentsApi.uploadImage(pageId, x, y, width, height, file, Date.now());
      
      // Add to Yjs with reference to uploaded image
      const componentId = addComponent('IMAGE', x, y, width, height, {
        hasImage: true,
        zIndex: Date.now()
      });

      if (componentId) {
        setSelectedComponentId(componentId);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    }

    // Reset file input
    e.target.value = '';
  };

  const handleComponentUpdate = (
    componentId: string,
    updates: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      text?: string;
    }
  ) => {
    updateComponent(componentId, updates);
  };

  const handleComponentDelete = (componentId: string) => {
    deleteComponent(componentId);
    if (selectedComponentId === componentId) {
      setSelectedComponentId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Page not found</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-500 mt-2 inline-block">
            ← Back to notebooks
          </Link>
        </div>
      </div>
    );
  }

  const componentArray = Array.from(components.values()).sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              to={`/notebook/${page.section.notebook?.id || ''}`}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{page.title}</h1>
              <p className="text-sm text-gray-500">
                {page.section.title} • {page.section.notebook?.title}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Connected</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600">Disconnected</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleAddTextComponent}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Type className="w-4 h-4 mr-2" />
            Text
          </button>
          <button
            onClick={handleAddImageComponent}
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Image className="w-4 h-4 mr-2" />
            Image
          </button>
          <button
            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 opacity-50 cursor-not-allowed"
            disabled
          >
            <Circle className="w-4 h-4 mr-2" />
            Drawing (Coming Soon)
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto">
        <div
          ref={canvasRef}
          className="relative min-h-full bg-white"
          style={{ minHeight: '800px', width: '100%' }}
          onClick={handleCanvasClick}
        >
          {componentArray.map((component) => (
            <PageComponent
              key={component.id}
              component={component}
              isSelected={selectedComponentId === component.id}
              onSelect={() => setSelectedComponentId(component.id)}
              onUpdate={(updates) => handleComponentUpdate(component.id, updates)}
              onDelete={() => handleComponentDelete(component.id)}
              getComponentText={() => getComponentText(component.id)}
            />
          ))}
        </div>
      </div>

      {/* Hidden file input for image uploads */}
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