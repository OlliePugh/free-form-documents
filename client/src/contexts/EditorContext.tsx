import React, { createContext, useContext, useState, useCallback } from 'react';
import { Editor } from '@tiptap/react';

interface EditorContextType {
  activeEditor: Editor | null;
  setActiveEditor: (editor: Editor | null) => void;
  // Format functions
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  toggleBulletList: () => void;
  toggleOrderedList: () => void;
  setTextAlign: (alignment: 'left' | 'center' | 'right' | 'justify') => void;
  // Table functions
  insertTable: () => void;
  addColumnBefore: () => void;
  addColumnAfter: () => void;
  deleteColumn: () => void;
  addRowBefore: () => void;
  addRowAfter: () => void;
  deleteRow: () => void;
  mergeCells: () => void;
  splitCell: () => void;
  deleteTable: () => void;
  // State checks
  isActive: (name: string, attributes?: Record<string, any>) => boolean;
  canExecute: (name: string, attributes?: Record<string, any>) => boolean;
}

const EditorContext = createContext<EditorContextType | null>(null);

export const useEditorContext = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditorContext must be used within an EditorProvider');
  }
  return context;
};

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeEditor, setActiveEditor] = useState<Editor | null>(null);

  const toggleBold = useCallback(() => {
    if (activeEditor) {
      activeEditor.chain().focus().toggleBold().run();
    }
  }, [activeEditor]);

  const toggleItalic = useCallback(() => {
    if (activeEditor) {
      activeEditor.chain().focus().toggleItalic().run();
    }
  }, [activeEditor]);

  const toggleUnderline = useCallback(() => {
    if (activeEditor) {
      activeEditor.chain().focus().toggleUnderline().run();
    }
  }, [activeEditor]);

  const toggleBulletList = useCallback(() => {
    if (activeEditor) {
      activeEditor.chain().focus().toggleBulletList().run();
    }
  }, [activeEditor]);

  const toggleOrderedList = useCallback(() => {
    if (activeEditor) {
      activeEditor.chain().focus().toggleOrderedList().run();
    }
  }, [activeEditor]);

  const setTextAlign = useCallback((alignment: 'left' | 'center' | 'right' | 'justify') => {
    if (activeEditor) {
      activeEditor.chain().focus().setTextAlign(alignment).run();
    }
  }, [activeEditor]);

  const insertTable = useCallback(() => {
    if (activeEditor) {
      activeEditor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }
  }, [activeEditor]);

  const addColumnBefore = useCallback(() => {
    if (activeEditor) {
      activeEditor.chain().focus().addColumnBefore().run();
    }
  }, [activeEditor]);

  const addColumnAfter = useCallback(() => {
    if (activeEditor) {
      activeEditor.chain().focus().addColumnAfter().run();
    }
  }, [activeEditor]);

  const deleteColumn = useCallback(() => {
    if (activeEditor) {
      activeEditor.chain().focus().deleteColumn().run();
    }
  }, [activeEditor]);

  const addRowBefore = useCallback(() => {
    if (activeEditor) {
      activeEditor.chain().focus().addRowBefore().run();
    }
  }, [activeEditor]);

  const addRowAfter = useCallback(() => {
    if (activeEditor) {
      activeEditor.chain().focus().addRowAfter().run();
    }
  }, [activeEditor]);

  const deleteRow = useCallback(() => {
    if (activeEditor) {
      activeEditor.chain().focus().deleteRow().run();
    }
  }, [activeEditor]);

  const mergeCells = useCallback(() => {
    if (activeEditor) {
      activeEditor.chain().focus().mergeCells().run();
    }
  }, [activeEditor]);

  const splitCell = useCallback(() => {
    if (activeEditor) {
      activeEditor.chain().focus().splitCell().run();
    }
  }, [activeEditor]);

  const deleteTable = useCallback(() => {
    if (activeEditor) {
      activeEditor.chain().focus().deleteTable().run();
    }
  }, [activeEditor]);

  const isActive = useCallback((name: string, attributes?: Record<string, any>) => {
    if (!activeEditor) return false;
    return activeEditor.isActive(name, attributes);
  }, [activeEditor]);

  const canExecute = useCallback((name: string, attributes?: Record<string, any>) => {
    if (!activeEditor) return false;
    return activeEditor.can().chain().focus()[name as keyof typeof activeEditor.can().chain().focus()]?.(attributes).run() ?? false;
  }, [activeEditor]);

  return (
    <EditorContext.Provider
      value={{
        activeEditor,
        setActiveEditor,
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
        canExecute,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};