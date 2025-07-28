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

  useEffect(() => {
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

    hocuspocusProvider.on('connect', handleConnect);
    hocuspocusProvider.on('disconnect', handleDisconnect);

    // Listen for changes in the shared map
    const handleComponentsChange = () => {
      const newComponents = new Map<string, YjsComponent>();
      
      yComponents.forEach((yComponent: Y.Map<any>, componentId: string) => {
        if (yComponent instanceof Y.Map) {
          const component: YjsComponent = {
            id: componentId,
            type: yComponent.get('type'),
            x: yComponent.get('x'),
            y: yComponent.get('y'),
            width: yComponent.get('width'),
            height: yComponent.get('height'),
            zIndex: yComponent.get('zIndex'),
            text: yComponent.get('text'),
            shapeData: yComponent.get('shapeData'),
            hasImage: yComponent.get('hasImage')
          };
          newComponents.set(componentId, component);
        }
      });
      
      setComponents(newComponents);
    };

    yComponents.observe(handleComponentsChange);
    
    // Initial load
    handleComponentsChange();

    return () => {
      yComponents.unobserve(handleComponentsChange);
      hocuspocusProvider.off('connect', handleConnect);
      hocuspocusProvider.off('disconnect', handleDisconnect);
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
    
    yComponent.set('id', componentId);
    yComponent.set('type', type);
    yComponent.set('x', x);
    yComponent.set('y', y);
    yComponent.set('width', width);
    yComponent.set('height', height);
    yComponent.set('zIndex', options.zIndex || 0);

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
  };

  const getComponentText = (componentId: string): Y.Text | null => {
    const component = components.get(componentId);
    return component?.text || null;
  };

  return {
    components,
    isConnected,
    addComponent,
    updateComponent,
    deleteComponent,
    getComponentText,
    doc,
    provider
  };
}