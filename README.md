# OneNote Clone - Collaborative Rich Text Editor

A modern, OneNote-like collaborative note-taking application built with React, TypeScript, and real-time collaboration features.

## 🚀 Features

### Rich Text Editing
- **Tiptap-powered editor** with OneNote-like formatting capabilities
- **Full formatting toolbar** with font families, colors, alignment, and more
- **Rich content support** including tables, lists, links, images, and blockquotes
- **Real-time collaboration** with operational transformation
- **Free-form canvas** allowing draggable and resizable text components

### OneNote-like UI/UX
- **Hierarchical navigation** with notebooks, sections, and pages
- **Collapsible sidebar** with tree-view navigation
- **Modern design** following Microsoft's Fluent Design principles
- **Responsive layout** that works on desktop and mobile
- **Grid background** for precise positioning (optional)

### Collaboration Features
- **Real-time sync** using Yjs and Hocuspocus
- **Multi-user editing** with conflict resolution
- **Live cursors** showing other users' positions
- **Connection status** indicators
- **Automatic saves** with debounced updates

### Performance Optimizations
- **Debounced updates** to reduce server load
- **Lazy loading** for large notebooks
- **Optimized re-renders** with React.memo and useMemo
- **Efficient WebSocket** connections
- **Loading states** with smooth animations

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tiptap** for rich text editing
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Yjs** for collaborative editing
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **Prisma** ORM with SQLite
- **Hocuspocus** for WebSocket collaboration
- **Multer** for file uploads
- **CORS** for cross-origin requests

## 📁 Key Components

- **OneNoteLayout.tsx** - Main layout with sidebar navigation
- **RichTextEditor.tsx** - Tiptap-based rich text editor with OneNote-like toolbar
- **PageEditor.tsx** - Free-form canvas for draggable components
- **PageComponent.tsx** - Draggable/resizable text and image components
- **useCollaboration.ts** - Real-time collaboration with Yjs
- **useDebounce.ts** - Performance optimization for frequent updates

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Running

1. **Backend Setup**
   ```bash
   cd server
   npm install
   npm run db:generate
   npm run db:migrate
   npm run dev  # Runs on http://localhost:3001
   ```

2. **Frontend Setup**
   ```bash
   cd client
   npm install
   npm run dev  # Runs on http://localhost:5173
   ```

## 📝 Usage

1. **Create Notebooks** - Organize your content with colored notebooks
2. **Add Sections** - Create sections within notebooks
3. **Create Pages** - Add pages for actual content
4. **Rich Text Editing** - Use the comprehensive formatting toolbar
5. **Free-form Layout** - Drag and resize text components anywhere
6. **Real-time Collaboration** - Share page URLs for collaborative editing

## 🎨 OneNote-like Features

- **Microsoft Fluent Design** styling with proper colors and typography
- **Hierarchical sidebar** with expandable notebooks and sections
- **Free-form canvas** with draggable/resizable components
- **Rich formatting toolbar** with fonts, colors, alignment, lists, tables
- **Grid background** for precise positioning
- **Real-time collaboration** with live cursors
- **Auto-save** functionality
- **Connection status** indicators

## 🧪 Testing

Server tests are included for API endpoints validation:
```bash
cd server
npm test
```

## 🔮 Future Enhancements

- Drawing support with canvas
- File attachments
- Search functionality
- Offline support
- Mobile app
- Export capabilities

---

**A polished OneNote experience with modern web technologies**