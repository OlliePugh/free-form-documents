import { useEffect, useState, useRef } from 'react';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { v4 as uuidv4 } from 'uuid';
import { PageComponent } from '../types';

const HOCUSPOCUS_URL = import.meta.env.VITE_HOCUSPOCUS_URL || 'ws://localhost:3001';

export interface YjsComponent {
  id: string;
  type: 'TEXT' | 'IMAGE' | 'DRAWING';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  text?: Y.Text;
  shapeData?: any;
  hasImage?: boolean;
}

export function useCollaboration(pageId: string) {
  const [doc] = useState(() => new Y.Doc());
  const [provider, setProvider] = useState<HocuspocusProvider | null>(null);
  const [components, setComponents] = useState<Map<string, YjsComponent>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const yComponentsRef = useRef<Y.Map<any> | null>(null);

  // Helper function to get the next zIndex
  const getNextZIndex = () => {
    if (!yComponentsRef.current) return 0;
    
    let maxZIndex = -1;
    yComponentsRef.current.forEach((yComponent) => {
      if (yComponent instanceof Y.Map) {
        const zIndex = yComponent.get('zIndex') || 0;
        maxZIndex = Math.max(maxZIndex, zIndex);
      }
    });
    
    return maxZIndex + 1;
  };

  useEffect(() => {
    console.log(`🔗 Initializing collaboration for page: ${pageId}`);
    
    // Create Hocuspocus provider
    const hocuspocusProvider = new HocuspocusProvider({
      url: HOCUSPOCUS_URL,
      name: `page:${pageId}`,
      document: doc,
    });

    setProvider(hocuspocusProvider);

    // Get the shared map for components
    const yComponents = doc.getMap('components');
    yComponentsRef.current = yComponents;

    // Listen for connection status
    const handleConnect = () => {
      console.log('🔗 Connected to collaboration server');
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log('🔌 Disconnected from collaboration server');
      setIsConnected(false);
    };

    // Listen for synced event (when initial data is loaded)
    const handleSynced = () => {
      console.log('📋 Initial document synced');
      handleComponentsChange(); // Ensure we load components after sync
    };

    hocuspocusProvider.on('connect', handleConnect);
    hocuspocusProvider.on('disconnect', handleDisconnect);
    hocuspocusProvider.on('synced', handleSynced);

    // Listen for changes in the shared map
    const handleComponentsChange = () => {
      const newComponents = new Map<string, YjsComponent>();
      
      console.log(`📦 Loading ${yComponents.size} components from Yjs`);
      
      yComponents.forEach((yComponent: Y.Map<any>, componentId: string) => {
        if (yComponent instanceof Y.Map) {
          const component: YjsComponent = {
            id: componentId,
            type: yComponent.get('type'),
            x: yComponent.get('x'),
            y: yComponent.get('y'),
            width: yComponent.get('width'),
            height: yComponent.get('height'),
            zIndex: yComponent.get('zIndex') || 0,
            text: yComponent.get('text'),
            shapeData: yComponent.get('shapeData'),
            hasImage: yComponent.get('hasImage')
          };
          newComponents.set(componentId, component);
        }
      });
      
      console.log(`📦 Loaded ${newComponents.size} components into React state`);
      setComponents(newComponents);
    };

    yComponents.observe(handleComponentsChange);
    
    // Initial load (in case components are already there)
    handleComponentsChange();

    return () => {
      yComponents.unobserve(handleComponentsChange);
      hocuspocusProvider.off('connect', handleConnect);
      hocuspocusProvider.off('disconnect', handleDisconnect);
      hocuspocusProvider.off('synced', handleSynced);
      hocuspocusProvider.destroy();
    };
  }, [pageId, doc]);

  const addComponent = (
    type: 'TEXT' | 'IMAGE' | 'DRAWING',
    x: number,
    y: number,
    width: number,
    height: number,
    options: {
      text?: string;
      shapeData?: any;
      hasImage?: boolean;
      zIndex?: number;
    } = {}
  ) => {
    if (!yComponentsRef.current) return null;

    const componentId = uuidv4();
    const yComponent = new Y.Map();
    
    // Use provided zIndex or calculate the next one
    const zIndex = options.zIndex !== undefined ? options.zIndex : getNextZIndex();
    
    yComponent.set('id', componentId);
    yComponent.set('type', type);
    yComponent.set('x', x);
    yComponent.set('y', y);
    yComponent.set('width', width);
    yComponent.set('height', height);
    yComponent.set('zIndex', zIndex);

    if (options.text) {
      const yText = new Y.Text(options.text);
      yComponent.set('text', yText);
    }

    if (options.shapeData) {
      yComponent.set('shapeData', options.shapeData);
    }

    if (options.hasImage) {
      yComponent.set('hasImage', true);
    }

    yComponentsRef.current.set(componentId, yComponent);
    console.log(`➕ Added component ${componentId} with zIndex ${zIndex}`);
    return componentId;
  };

  const updateComponent = (
    componentId: string,
    updates: {
      x?: number;
      y?: number;
      width?: number;
      height?: number;
      zIndex?: number;
      text?: string;
      shapeData?: any;
    }
  ) => {
    if (!yComponentsRef.current) return;

    const yComponent = yComponentsRef.current.get(componentId);
    if (!yComponent || !(yComponent instanceof Y.Map)) return;

    doc.transact(() => {
      if (updates.x !== undefined) yComponent.set('x', updates.x);
      if (updates.y !== undefined) yComponent.set('y', updates.y);
      if (updates.width !== undefined) yComponent.set('width', updates.width);
      if (updates.height !== undefined) yComponent.set('height', updates.height);
      if (updates.zIndex !== undefined) yComponent.set('zIndex', updates.zIndex);
      if (updates.shapeData !== undefined) yComponent.set('shapeData', updates.shapeData);
      
      if (updates.text !== undefined) {
        const existingText = yComponent.get('text');
        if (existingText instanceof Y.Text) {
          // Update existing Y.Text
          existingText.delete(0, existingText.length);
          existingText.insert(0, updates.text);
        } else {
          // Create new Y.Text
          const yText = new Y.Text(updates.text);
          yComponent.set('text', yText);
        }
      }
    });
  };

  const deleteComponent = (componentId: string) => {
    if (!yComponentsRef.current) return;
    yComponentsRef.current.delete(componentId);
    console.log(`🗑️ Deleted component ${componentId}`);
  };

  const getComponentText = (componentId: string): Y.Text | null => {
    const component = components.get(componentId);
    return component?.text || null;
  };

  // Helper function to bring component to front
  const bringToFront = (componentId: string) => {
    const nextZIndex = getNextZIndex();
    updateComponent(componentId, { zIndex: nextZIndex });
  };

  // Helper function to send component to back
  const sendToBack = (componentId: string) => {
    updateComponent(componentId, { zIndex: 0 });
    
    // Adjust other components' zIndex to make room
    const otherComponents = Array.from(components.values()).filter(c => c.id !== componentId);
    otherComponents.forEach((component, index) => {
      updateComponent(component.id, { zIndex: index + 1 });
    });
  };

  return {
    components,
    isConnected,
    addComponent,
    updateComponent,
    deleteComponent,
    getComponentText,
    bringToFront,
    sendToBack,
    doc,
    provider
  };
}