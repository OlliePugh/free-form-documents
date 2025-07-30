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
import { useEffect, useRef, useState } from 'react';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Type,
  Palette,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Undo,
  Redo
} from 'lucide-react';
import * as Y from 'yjs';
import { useDebounce } from '../hooks/useDebounce';

interface RichTextEditorProps {
  yText: Y.Text | null;
  editable?: boolean;
  placeholder?: string;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

const colorOptions = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#800000', '#008000', '#000080', '#808000', '#800080', '#008080', '#C0C0C0'
];

const fontFamilyOptions = [
  { label: 'Calibri', value: 'Calibri, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' }
];

export function RichTextEditor({ 
  yText, 
  editable = true, 
  placeholder = 'Start typing...',
  className = '',
  onFocus,
  onBlur
}: RichTextEditorProps) {
  // If no yText is provided, show a simple loading state
  if (!yText) {
    return (
      <div className={`rich-text-editor ${className} flex items-center justify-center h-40 bg-gray-50 border rounded`}>
        <div className="text-gray-500">Connecting to collaboration server...</div>
      </div>
    );
  }
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const fontPickerRef = useRef<HTMLDivElement>(null);

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
      ...(yText && yText.doc ? [
        Collaboration.configure({
          document: yText.doc,
        }),
      ] : []),
    ],
    content: yText ? yText.toString() : '',
    editable,
    onFocus: () => {
      onFocus?.();
    },
    onBlur: () => {
      onBlur?.();
    },
  }, [yText, editable]); // Add dependencies to recreate editor when yText changes

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

  // Update Y.Text when editor content changes (debounced for performance)
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

  // Handle clicks outside color/font pickers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
      if (fontPickerRef.current && !fontPickerRef.current.contains(event.target as Node)) {
        setShowFontPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!editor) {
    return (
      <div className={`rich-text-editor ${className} flex items-center justify-center h-40`}>
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const insertTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Toolbar */}
      {editable && (
        <div className="border-b border-gray-200 bg-white p-2 flex flex-wrap items-center gap-1 sticky top-0 z-10">
          {/* Font Family */}
          <div className="relative" ref={fontPickerRef}>
            <button
              onClick={() => setShowFontPicker(!showFontPicker)}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 min-w-[120px] text-left"
            >
              <Type className="w-4 h-4 inline mr-2" />
              {fontFamilyOptions.find(f => editor.isActive('textStyle', { fontFamily: f.value }))?.label || 'Calibri'}
            </button>
            {showFontPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-20 min-w-[150px]">
                {fontFamilyOptions.map((font) => (
                  <button
                    key={font.value}
                    onClick={() => {
                      editor.chain().focus().setFontFamily(font.value).run();
                      setShowFontPicker(false);
                    }}
                    className="block w-full px-3 py-2 text-left hover:bg-gray-100 text-sm"
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Basic formatting */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bold') ? 'bg-blue-100' : ''}`}
          >
            <Bold className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('italic') ? 'bg-blue-100' : ''}`}
          >
            <Italic className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('underline') ? 'bg-blue-100' : ''}`}
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('strike') ? 'bg-blue-100' : ''}`}
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          {/* Color picker */}
          <div className="relative" ref={colorPickerRef}>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded hover:bg-gray-100"
            >
              <Palette className="w-4 h-4" />
            </button>
            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-20 p-2">
                <div className="grid grid-cols-7 gap-1">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        editor.chain().focus().setColor(color).run();
                        setShowColorPicker(false);
                      }}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Alignment */}
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'left' }) ? 'bg-blue-100' : ''}`}
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'center' }) ? 'bg-blue-100' : ''}`}
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive({ textAlign: 'right' }) ? 'bg-blue-100' : ''}`}
          >
            <AlignRight className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Lists */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('bulletList') ? 'bg-blue-100' : ''}`}
          >
            <List className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('orderedList') ? 'bg-blue-100' : ''}`}
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-gray-100 ${editor.isActive('blockquote') ? 'bg-blue-100' : ''}`}
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Insert elements */}
          <button
            onClick={addLink}
            className="p-2 rounded hover:bg-gray-100"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={addImage}
            className="p-2 rounded hover:bg-gray-100"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          
          <button
            onClick={insertTable}
            className="p-2 rounded hover:bg-gray-100"
          >
            <TableIcon className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Undo/Redo */}
          <button
            onClick={() => editor.chain().focus().undo().run()}
            className="p-2 rounded hover:bg-gray-100"
            disabled={!editor.can().undo()}
          >
            <Undo className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => editor.chain().focus().redo().run()}
            className="p-2 rounded hover:bg-gray-100"
            disabled={!editor.can().redo()}
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Editor Content */}
      <div className="prose prose-sm max-w-none p-4 min-h-[200px] focus-within:outline-none">
        <EditorContent
          editor={editor}
          className="outline-none"
          style={{
            minHeight: '100px',
          }}
        />
      </div>

      {/* Custom styles for the editor */}
      <style jsx>{`
        .ProseMirror {
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror table {
          border-collapse: collapse;
          table-layout: fixed;
          width: 100%;
          margin: 0;
          overflow: hidden;
        }
        .ProseMirror table td, .ProseMirror table th {
          min-width: 1em;
          border: 2px solid #ced4da;
          padding: 3px 5px;
          vertical-align: top;
          box-sizing: border-box;
          position: relative;
        }
        .ProseMirror table th {
          font-weight: bold;
          text-align: left;
          background-color: #f8f9fa;
        }
        .ProseMirror table .selectedCell:after {
          z-index: 2;
          position: absolute;
          content: "";
          left: 0; right: 0; top: 0; bottom: 0;
          background: rgba(200, 200, 255, 0.4);
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}