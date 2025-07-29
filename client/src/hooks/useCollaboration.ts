import { useEffect, useState, useRef } from "react";
import { HocuspocusProvider } from "@hocuspocus/provider";
import * as Y from "yjs";
import { v4 as uuidv4 } from "uuid";
import { PageComponent } from "../types";

const HOCUSPOCUS_URL =
  (import.meta as any).env?.VITE_HOCUSPOCUS_URL || "ws://localhost:3001";

export interface YjsComponent {
  id: string;
  type: "TEXT" | "IMAGE" | "DRAWING";
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
  const [components, setComponents] = useState<Map<string, YjsComponent>>(
    new Map()
  );
  const [isConnected, setIsConnected] = useState(false);
  const yComponentsRef = useRef<Y.Map<any> | null>(null);

  // Helper function to get the next zIndex
  const getNextZIndex = () => {
    if (!yComponentsRef.current) return 0;

    let maxZIndex = -1;
    yComponentsRef.current.forEach((yComponent) => {
      if (yComponent instanceof Y.Map) {
        const zIndex = yComponent.get("zIndex") || 0;
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
      connect: true,
    });

    setProvider(hocuspocusProvider);

    // Debug connection attempt
    console.log("🔍 Attempting to connect to:", HOCUSPOCUS_URL);
    console.log("📄 Document name:", `page:${pageId}`);

    // Get the shared map for components
    const yComponents = doc.getMap("components");
    yComponentsRef.current = yComponents;

    // Listen for connection status
    const handleConnect = () => {
      console.log("🔗 Connected to collaboration server");
      console.log("🔍 Connection details:", {
        url: HOCUSPOCUS_URL,
        documentName: `page:${pageId}`,
        provider: hocuspocusProvider,
      });
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log("🔌 Disconnected from collaboration server");
      setIsConnected(false);
    };

    // Listen for synced event (when initial data is loaded)
    const handleSynced = () => {
      console.log("📋 Initial document synced");
      handleComponentsChange(); // Ensure we load components after sync
    };

    hocuspocusProvider.on("connect", handleConnect);
    hocuspocusProvider.on("disconnect", handleDisconnect);
    hocuspocusProvider.on("synced", handleSynced);

    // Listen for changes in the shared map
    const handleComponentsChange = () => {
      console.log(`📦 Yjs components changed, updating React state`);
      console.log(`📊 Current components in Yjs: ${yComponents.size}`);

      setComponents((prevComponents) => {
        const newComponents = new Map(prevComponents);
        let changeCount = 0;

        yComponents.forEach((yComponent: unknown, componentId: string) => {
          if (yComponent instanceof Y.Map) {
            const component: YjsComponent = {
              id: componentId,
              type: yComponent.get("type"),
              x: yComponent.get("x"),
              y: yComponent.get("y"),
              width: yComponent.get("width"),
              height: yComponent.get("height"),
              zIndex: yComponent.get("zIndex") || 0,
              text: yComponent.get("text"),
              shapeData: yComponent.get("shapeData"),
              hasImage: yComponent.get("hasImage"),
            };

            const existingComponent = newComponents.get(componentId);
            if (existingComponent) {
              // Check if position actually changed
              const positionChanged =
                existingComponent.x !== component.x ||
                existingComponent.y !== component.y ||
                existingComponent.width !== component.width ||
                existingComponent.height !== component.height;

              if (positionChanged) {
                console.log(
                  `🔄 Position update for component ${componentId}:`,
                  `x: ${existingComponent.x} → ${component.x}`,
                  `y: ${existingComponent.y} → ${component.y}`
                );
                changeCount++;
              } else {
                console.log(
                  `🔄 Updating existing component ${componentId} from Yjs`
                );
              }
            } else {
              console.log(`➕ Adding new component ${componentId} from Yjs`);
              changeCount++;
            }

            newComponents.set(componentId, component);
          }
        });

        // Remove components that no longer exist in Yjs
        const yjsComponentIds = new Set(yComponents.keys());
        for (const [componentId, component] of newComponents.entries()) {
          if (!yjsComponentIds.has(componentId)) {
            console.log(
              `🗑️ Removing component ${componentId} from React state`
            );
            newComponents.delete(componentId);
            changeCount++;
          }
        }

        console.log(
          `📦 React state updated: ${newComponents.size} components, ${changeCount} changes`
        );
        return newComponents;
      });
    };

    // Keep track of component observers for cleanup
    const componentObservers = new Map<string, () => void>();

    // Observe the components map for additions/deletions
    yComponents.observe(handleComponentsChange);

    // Observe individual components for property changes
    const observeComponent = (yComponent: Y.Map<any>, componentId: string) => {
      const observer = () => {
        console.log(
          `🔄 Individual component ${componentId} changed, triggering update`
        );
        handleComponentsChange();
      };
      yComponent.observe(observer);
      componentObservers.set(componentId, observer);

      // Also observe the text object if it exists
      const textObserver = () => {
        console.log(
          `📝 Text content changed for component ${componentId}, triggering update`
        );
        handleComponentsChange();
      };

      const yText = yComponent.get("text");
      if (yText instanceof Y.Text) {
        console.log(`📝 Setting up text observer for component ${componentId}`);
        yText.observe(textObserver);
        componentObservers.set(`${componentId}-text`, textObserver);
      }
    };

    // Set up observation for existing components
    yComponents.forEach((yComponent: unknown, componentId: string) => {
      if (yComponent instanceof Y.Map) {
        observeComponent(yComponent, componentId);
      }
    });

    // Observe for new components being added
    yComponents.observe((event: any) => {
      event.changes.added.forEach((change: any) => {
        const yComponent = yComponents.get(change.key);
        if (yComponent instanceof Y.Map) {
          console.log(
            `👀 Setting up observation for new component: ${change.key}`
          );
          observeComponent(yComponent, change.key);
        }
      });
    });

    // Initial load (in case components are already there)
    handleComponentsChange();

    return () => {
      yComponents.unobserve(handleComponentsChange);

      // Clean up individual component observers
      componentObservers.forEach((observer, componentId) => {
        if (componentId.endsWith("-text")) {
          // This is a text observer, find the component and its text
          const actualComponentId = componentId.replace("-text", "");
          const yComponent = yComponents.get(actualComponentId);
          if (yComponent instanceof Y.Map) {
            const yText = yComponent.get("text");
            if (yText instanceof Y.Text) {
              yText.unobserve(observer);
            }
          }
        } else {
          // This is a component observer
          const yComponent = yComponents.get(componentId);
          if (yComponent instanceof Y.Map) {
            yComponent.unobserve(observer);
          }
        }
      });
      componentObservers.clear();

      hocuspocusProvider.off("connect", handleConnect);
      hocuspocusProvider.off("disconnect", handleDisconnect);
      hocuspocusProvider.off("synced", handleSynced);
      hocuspocusProvider.destroy();
    };
  }, [pageId, doc]);

  const addComponent = (
    type: "TEXT" | "IMAGE" | "DRAWING",
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
    const zIndex =
      options.zIndex !== undefined ? options.zIndex : getNextZIndex();

    yComponent.set("id", componentId);
    yComponent.set("type", type);
    yComponent.set("x", x);
    yComponent.set("y", y);
    yComponent.set("width", width);
    yComponent.set("height", height);
    yComponent.set("zIndex", zIndex);

    if (options.text) {
      const yText = new Y.Text(options.text);
      yComponent.set("text", yText);
    }

    if (options.shapeData) {
      yComponent.set("shapeData", options.shapeData);
    }

    if (options.hasImage) {
      yComponent.set("hasImage", true);
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
    console.log("🔄 Updating component:", componentId, updates);

    if (!yComponentsRef.current) {
      console.log("❌ No yComponentsRef.current");
      return;
    }

    const yComponent = yComponentsRef.current.get(componentId);
    if (!yComponent || !(yComponent instanceof Y.Map)) {
      console.log("❌ Component not found or not a Y.Map:", componentId);
      return;
    }

    console.log("🔄 Starting Yjs transaction for component:", componentId);

    // Update Yjs document first for real-time sync
    doc.transact(() => {
      if (updates.x !== undefined) {
        console.log("📍 Setting x to:", updates.x);
        yComponent.set("x", updates.x);
      }
      if (updates.y !== undefined) {
        console.log("📍 Setting y to:", updates.y);
        yComponent.set("y", updates.y);
      }
      if (updates.width !== undefined) {
        console.log("📏 Setting width to:", updates.width);
        yComponent.set("width", updates.width);
      }
      if (updates.height !== undefined) {
        console.log("📏 Setting height to:", updates.height);
        yComponent.set("height", updates.height);
      }
      if (updates.zIndex !== undefined) {
        console.log("🔝 Setting zIndex to:", updates.zIndex);
        yComponent.set("zIndex", updates.zIndex);
      }
      if (updates.shapeData !== undefined) {
        console.log("🎨 Setting shapeData to:", updates.shapeData);
        yComponent.set("shapeData", updates.shapeData);
      }

      if (updates.text !== undefined) {
        const existingText = yComponent.get("text");
        if (existingText instanceof Y.Text) {
          // Update existing Y.Text
          existingText.delete(0, existingText.length);
          existingText.insert(0, updates.text);
        } else {
          // Create new Y.Text
          const yText = new Y.Text(updates.text);
          yComponent.set("text", yText);
        }
      }
    });

    console.log("✅ Yjs transaction completed for component:", componentId);

    // Update React state optimistically after Yjs update to ensure consistency
    setComponents((prevComponents) => {
      const newComponents = new Map(prevComponents);
      const existingComponent = newComponents.get(componentId);
      if (existingComponent) {
        const updatedComponent = {
          ...existingComponent,
          ...(updates.x !== undefined && { x: updates.x }),
          ...(updates.y !== undefined && { y: updates.y }),
          ...(updates.width !== undefined && { width: updates.width }),
          ...(updates.height !== undefined && { height: updates.height }),
          ...(updates.zIndex !== undefined && { zIndex: updates.zIndex }),
          ...(updates.shapeData !== undefined && {
            shapeData: updates.shapeData,
          }),
        };
        newComponents.set(componentId, updatedComponent);
        console.log("⚡ Updated React state for component:", componentId);
      }
      return newComponents;
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
    const otherComponents = Array.from(components.values()).filter(
      (c) => c.id !== componentId
    );
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
    provider,
  };
}
