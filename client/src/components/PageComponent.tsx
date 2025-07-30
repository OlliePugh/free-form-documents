import { useState, useRef, useEffect, useCallback } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import { X } from 'lucide-react';
import * as Y from 'yjs';
import { YjsComponent } from '../hooks/useCollaboration';
import { componentsApi } from '../api/client';
import { SimpleTextEditor } from './SimpleTextEditor';
import 'react-resizable/css/styles.css';

interface PageComponentProps {
  component: YjsComponent;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: { x?: number; y?: number; width?: number; height?: number; text?: string }) => void;
  onDelete: () => void;
  getComponentText: () => Y.Text | null;
}

// Throttle function to limit update frequency
const throttle = (func: Function, limit: number) => {
  let inThrottle: boolean;
  return function (this: any, ...args: any[]) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export function PageComponent({
  component,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  getComponentText
}: PageComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const componentRef = useRef<HTMLDivElement>(null);
  const lastUpdateRef = useRef<{ x: number; y: number } | null>(null);

  // Throttled update function for drag events (update every 50ms max)
  const throttledUpdate = useCallback(
    throttle((x: number, y: number) => {
      console.log("🔄 Throttled update:", { componentId: component.id, x, y });
      onUpdate({ x, y });
      lastUpdateRef.current = { x, y };
    }, 50),
    [component.id, onUpdate]
  );

  const handleDragStart = () => {
    console.log("🖱️ Drag start on component:", component.id);
    setIsDragging(true);
  };

  const handleDrag = (e: any, data: { x: number; y: number }) => {
    console.log("🖱️ Drag event:", { componentId: component.id, x: data.x, y: data.y });
    // Use throttled update during drag to avoid overwhelming WebSocket
    throttledUpdate(data.x, data.y);
  };

  const handleDragStop = (e: any, data: { x: number; y: number }) => {
    console.log("🖱️ Drag stop on component:", component.id, { x: data.x, y: data.y });
    setIsDragging(false);

    // Final update to ensure exact position is set (not throttled)
    if (!lastUpdateRef.current ||
      lastUpdateRef.current.x !== data.x ||
      lastUpdateRef.current.y !== data.y) {
      console.log("🎯 Final position update:", { componentId: component.id, x: data.x, y: data.y });
      onUpdate({ x: data.x, y: data.y });
    }
  };

  const handleResize = (e: any, data: { size: { width: number; height: number } }) => {
    console.log("🔄 Resize event triggered:", { componentId: component.id, width: data.size.width, height: data.size.height });
    onUpdate({ width: data.size.width, height: data.size.height });
  };

  const handleClick = (e: React.MouseEvent) => {
    console.log("🖱️ Click event on component:", component.id);
    e.stopPropagation();
    onSelect();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handleTextFocus = () => {
    setIsEditing(true);
  };

  const handleTextBlur = () => {
    setIsEditing(false);
  };

  const renderContent = () => {
    switch (component.type) {
      case 'TEXT':
        const yText = getComponentText();
        return (
          <SimpleTextEditor
            yText={yText}
            componentId={component.id}
            editable={true}
            placeholder="Type your notes here..."
            className="w-full h-full"
            onFocus={handleTextFocus}
            onBlur={handleTextBlur}
          />
        );

      case 'IMAGE':
        if (component.hasImage) {
          return (
            <img
              src={componentsApi.getImageUrl(component.id)}
              alt="Component image"
              className="w-full h-full object-cover rounded"
              draggable={false}
            />
          );
        }
        return (
          <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 rounded flex items-center justify-center">
            <span className="text-gray-500 text-sm">Image</span>
          </div>
        );

      case 'DRAWING':
        return (
          <div className="w-full h-full bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-500 text-sm">Drawing (Coming Soon)</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Draggable
      position={{ x: component.x, y: component.y }}
      onStart={handleDragStart}
      onDrag={handleDrag}
      onStop={handleDragStop}
      handle=".drag-handle"
      disabled={isEditing}
      nodeRef={componentRef}
    >
      <div
        ref={componentRef}
        className={`component-container absolute ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''}`}
        style={{ zIndex: component.zIndex }}
        onClick={handleClick}
      >
        <ResizableBox
          width={component.width}
          height={component.height}
          onResize={handleResize}
          minConstraints={[200, 150]} // Larger minimum size for rich text editor
          resizeHandles={['se']}
        >
          <div className={`w-full h-full ${component.type === 'TEXT' ? 'bg-white' : 'bg-white'} border-2 ${isSelected ? 'border-blue-400' : 'border-gray-200'} rounded-lg shadow-sm relative overflow-hidden`}>
            {/* Drag handle - only show when not editing text */}
            {!isEditing && (
              <div
                className="drag-handle absolute top-0 left-0 right-0 h-3 cursor-move bg-blue-200 opacity-0 hover:opacity-75 z-20 transition-opacity"
                onClick={() => console.log("🖱️ Drag handle clicked")}
              />
            )}

            {/* Delete button - only show when selected and not editing */}
            {isSelected && !isEditing && (
              <button
                onClick={handleDeleteClick}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 z-30 shadow-lg"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Content */}
            <div className="w-full h-full relative">
              {renderContent()}
            </div>
          </div>
        </ResizableBox>
      </div>
    </Draggable>
  );
}