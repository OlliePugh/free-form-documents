import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import { Underline } from '@tiptap/extension-underline';
import { TextAlign } from '@tiptap/extension-text-align';
import { Collaboration } from '@tiptap/extension-collaboration';
import { Image } from '@tiptap/extension-image';
import { Link } from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { useEffect, useState } from 'react';
import * as Y from 'yjs';
import { useDebounce } from '../hooks/useDebounce';
import { useEditorContext } from '../contexts/EditorContext';

interface SimpleTextEditorProps {
  yText: Y.Text | null;
  componentId: string;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

export function SimpleTextEditor({ 
  yText, 
  componentId,
  editable = true, 
  placeholder = 'Start typing...',
  className = '',
  onFocus,
  onBlur
}: SimpleTextEditorProps) {
  const { setActiveEditor } = useEditorContext();
  
  // If no yText is provided, show a simple loading state
  if (!yText) {
    return (
      <div className={`simple-text-editor ${className} flex items-center justify-center h-full bg-gray-50 border rounded`}>
        <div className="text-gray-500 text-sm">Loading...</div>
      </div>
    );
  }

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false, // We'll use Yjs for history
      }),
      TextStyle,
      Color,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
             // Don't use Collaboration extension in individual components
       // The collaboration is handled at the Y.Text level
    ],
    content: yText ? yText.toString() : '',
    editable,
    editorProps: {
      attributes: {
        'data-placeholder': placeholder,
      },
    },
    onFocus: () => {
      onFocus?.();
    },
    onBlur: () => {
      onBlur?.();
    },
  }, [yText, editable, componentId]);

  // Debounced content updates for performance
  const [editorContent, setEditorContent] = useState('');
  const debouncedContent = useDebounce(editorContent, 300);

  useEffect(() => {
    if (!editor || !yText) return;

    const handleUpdate = () => {
      const html = editor.getHTML();
      setEditorContent(html);
    };

    editor.on('update', handleUpdate);
    return () => editor.off('update', handleUpdate);
  }, [editor]);

  useEffect(() => {
    if (!yText || !debouncedContent) return;
    
    const currentYText = yText.toString();
    if (debouncedContent !== currentYText) {
      yText.delete(0, yText.length);
      yText.insert(0, debouncedContent);
    }
  }, [debouncedContent, yText]);

  // Sync with Y.Text changes
  useEffect(() => {
    if (!editor || !yText) return;

    const handleYTextChange = () => {
      const currentContent = editor.getHTML();
      const yTextContent = yText.toString();
      
      if (currentContent !== yTextContent && yTextContent !== '') {
        editor.commands.setContent(yTextContent, false);
      }
    };

    yText.observe(handleYTextChange);
    return () => yText.unobserve(handleYTextChange);
  }, [editor, yText]);

  // Register editor on focus/blur
  useEffect(() => {
    if (!editor) return;

    const handleFocus = () => {
      setActiveEditor(editor);
      onFocus?.();
    };

    const handleBlur = () => {
      setActiveEditor(null);
      onBlur?.();
    };

    editor.on('focus', handleFocus);
    editor.on('blur', handleBlur);

    return () => {
      editor.off('focus', handleFocus);
      editor.off('blur', handleBlur);
    };
  }, [editor, setActiveEditor, onFocus, onBlur]);

  if (!editor) {
    return (
      <div className={`simple-text-editor ${className} flex items-center justify-center h-full`}>
        <div className="text-gray-500 text-sm">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className={`simple-text-editor ${className} h-full`}>
      {/* No toolbar - just the editor */}
      <div className="prose prose-sm max-w-none p-3 h-full focus-within:outline-none">
        <EditorContent
          editor={editor}
          className="outline-none h-full"
        />
      </div>

      {/* Custom styles for the simple editor */}
      <style jsx>{`
        .ProseMirror {
          outline: none !important;
          height: 100%;
          font-family: 'Calibri', 'Segoe UI', sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: var(--onenote-text);
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }

        .ProseMirror p {
          margin: 0.25em 0;
        }

        .ProseMirror h1 {
          font-size: 1.5em;
          font-weight: 600;
          margin: 0.5em 0 0.25em 0;
        }

        .ProseMirror h2 {
          font-size: 1.3em;
          font-weight: 600;
          margin: 0.4em 0 0.2em 0;
        }

        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.2em;
          margin: 0.25em 0;
        }

        .ProseMirror li {
          margin: 0.1em 0;
        }
      `}</style>
    </div>
  );
}