import { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import { ResizableBox } from 'react-resizable';
import { X } from 'lucide-react';
import * as Y from 'yjs';
import { YjsComponent } from '../hooks/useCollaboration';
import { componentsApi } from '../api/client';
import 'react-resizable/css/styles.css';

interface PageComponentProps {
  component: YjsComponent;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: { x?: number; y?: number; width?: number; height?: number; text?: string }) => void;
  onDelete: () => void;
  getComponentText: () => Y.Text | null;
}

export function PageComponent({
  component,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  getComponentText
}: PageComponentProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    // Sync with Y.Text content
    const yText = getComponentText();
    if (yText) {
      setEditingText(yText.toString());

      const handleTextChange = () => {
        setEditingText(yText.toString());
      };

      yText.observe(handleTextChange);
      return () => yText.unobserve(handleTextChange);
    } else if (component.type === 'TEXT') {
      setEditingText('Click to edit text');
    }
  }, [component.id, getComponentText]);

  const handleDrag = (e: any, data: { x: number; y: number }) => {
    console.log("🖱️ Drag event triggered:", { x: data.x, y: data.y });
    // Update optimistically - this will update the React state immediately
    onUpdate({ x: data.x, y: data.y });
  };

  const handleResize = (e: any, data: { size: { width: number; height: number } }) => {
    onUpdate({ width: data.size.width, height: data.size.height });
  };

  const handleTextDoubleClick = () => {
    if (component.type === 'TEXT') {
      setIsEditing(true);
    }
  };

  const handleTextSubmit = () => {
    setIsEditing(false);
    const yText = getComponentText();
    if (yText) {
      yText.delete(0, yText.length);
      yText.insert(0, editingText);
    } else {
      onUpdate({ text: editingText });
    }
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      // Reset to original text
      const yText = getComponentText();
      if (yText) {
        setEditingText(yText.toString());
      }
    }
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

  const renderContent = () => {
    switch (component.type) {
      case 'TEXT':
        if (isEditing) {
          return (
            <textarea
              ref={textareaRef}
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              onBlur={handleTextSubmit}
              onKeyDown={handleTextKeyDown}
              className="w-full h-full resize-none border-none outline-none bg-transparent p-2 text-sm text-gray-900"
              style={{ minHeight: '100%' }}
            />
          );
        }
        return (
          <div
            className="w-full h-full p-2 text-sm whitespace-pre-wrap cursor-text text-gray-900"
            onDoubleClick={handleTextDoubleClick}
          >
            {editingText || 'Click to edit text'}
          </div>
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
      onDrag={handleDrag}
      onStart={() => console.log("🖱️ Drag start on component:", component.id)}
      onStop={() => console.log("🖱️ Drag stop on component:", component.id)}
      handle=".drag-handle"
      disabled={isEditing}
      nodeRef={componentRef}
    >
      <div
        ref={componentRef}
        className={`component-container absolute ${isSelected ? 'selected' : ''}`}
        style={{ zIndex: component.zIndex }}
        onClick={handleClick}
      >
        <ResizableBox
          width={component.width}
          height={component.height}
          onResize={handleResize}
          minConstraints={[50, 30]}
          resizeHandles={['se']}
        >
          <div className="w-full h-full bg-white border border-gray-200 rounded shadow-sm relative">
            {/* Drag handle - top border area */}
            <div
              className="drag-handle absolute top-0 left-0 right-0 h-3 cursor-move bg-blue-200 opacity-50 z-20"
              onClick={() => console.log("🖱️ Drag handle clicked")}
            />

            {/* Delete button */}
            {isSelected && !isEditing && (
              <button
                onClick={handleDeleteClick}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 z-30"
              >
                <X className="w-3 h-3" />
              </button>
            )}

            {/* Content */}
            <div className="w-full h-full relative pointer-events-auto">
              {renderContent()}
            </div>
          </div>
        </ResizableBox>
      </div>
    </Draggable>
  );
}