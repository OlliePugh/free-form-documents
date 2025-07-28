# 📝 OneNote Clone - Collaborative Note-Taking App

A full-stack collaborative note-taking application similar to Microsoft OneNote, built with React, Node.js, SQLite, and Yjs for real-time collaboration.

## ✨ Features

- **📚 Hierarchical Organization**: Notebooks → Sections → Pages
- **🎨 Rich Content**: Text and image components with absolute positioning
- **🔄 Real-time Collaboration**: Multiple users can edit pages simultaneously using Yjs
- **📱 Modern UI**: Clean, responsive interface built with React and Tailwind CSS
- **🖱️ Drag & Drop**: Move and resize components on the canvas
- **📸 Image Support**: Upload and display images stored in SQLite
- **🌐 WebSocket Sync**: Real-time synchronization via Hocuspocus server

## 🏗️ Architecture

### Backend
- **Node.js + TypeScript**: RESTful API server
- **SQLite**: Local database with Prisma ORM
- **Hocuspocus**: WebSocket server for Yjs collaboration
- **Express**: Web framework with CORS and file upload support

### Frontend
- **React + TypeScript**: Modern UI with hooks and context
- **Yjs**: Conflict-free replicated data types for collaboration
- **Tailwind CSS**: Utility-first styling
- **React Router**: Client-side routing
- **React Draggable/Resizable**: Interactive components

### Database Schema
```sql
Notebooks (id, title, color, timestamps)
  ↓
Sections (id, title, notebookId, timestamps)
  ↓  
Pages (id, title, sectionId, timestamps)
  ↓
PageComponents (id, pageId, type, x, y, width, height, zIndex, text?, imageData?, shapeData?, timestamps)
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### 1. Clone Repository
```bash
git clone <repository-url>
cd onenote-clone
```

### 2. Setup Backend
```bash
cd server

# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Run database migrations (creates SQLite database)
npx prisma migrate dev --name init

# Seed database with sample data
npm run db:seed

# Start development server (API on :3000, Hocuspocus on :3001)
npm run dev
```

### 3. Setup Frontend
```bash
# Open new terminal
cd client

# Install dependencies
npm install

# Start development server (on :5173)
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000
- **Database**: SQLite file at `server/dev.db`

## 📖 Usage Guide

### Creating Content
1. **Notebooks**: Create and organize your note collections
2. **Sections**: Add sections within notebooks to categorize content
3. **Pages**: Create pages within sections for actual content
4. **Components**: Add text and image components to pages

### Collaborative Editing
1. Open the same page in multiple browser tabs/windows
2. Changes are synchronized in real-time across all clients
3. Connection status shown in top-right corner
4. Conflict resolution handled automatically by Yjs

### Component Interaction
- **Select**: Click to select a component
- **Move**: Drag to reposition
- **Resize**: Drag the resize handle in bottom-right corner
- **Edit Text**: Double-click text components to edit
- **Delete**: Click the X button on selected components
- **Images**: Use toolbar to upload images

## 🛠️ Development

### Project Structure
```
/
├── server/               # Backend application
│   ├── src/
│   │   ├── routes/      # API endpoints
│   │   ├── realtime/    # Hocuspocus server
│   │   ├── db.ts        # Database connection
│   │   └── index.ts     # Main server file
│   ├── prisma/          # Database schema & migrations
│   ├── dev.db          # SQLite database (created after migration)
│   └── package.json
├── client/              # Frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks (Yjs)
│   │   ├── api/         # API client
│   │   └── types/       # TypeScript types
│   └── package.json
└── README.md
```

### API Endpoints
- `GET /api/notebooks` - List all notebooks
- `POST /api/notebooks` - Create notebook
- `GET /api/sections/notebook/:id` - Get sections for notebook
- `POST /api/sections` - Create section
- `GET /api/pages/section/:id` - Get pages for section
- `POST /api/pages` - Create page
- `GET /api/components/page/:id` - Get components for page
- `POST /api/components` - Create component
- `POST /api/components/upload-image` - Upload image
- `GET /api/components/image/:id` - Serve image
- `GET /health` - Health check endpoint

### Environment Variables
Create `.env` files for configuration:

**server/.env**
```env
DATABASE_URL="file:./dev.db"
PORT=3000
HOCUSPOCUS_PORT=3001
```

**client/.env** (optional)
```env
VITE_API_URL=http://localhost:3000
VITE_HOCUSPOCUS_URL=ws://localhost:3001
```

## ✅ Current Status

The application has been successfully built with:

### ✅ Completed Features
- [x] Complete backend API with all CRUD operations
- [x] SQLite database with Prisma ORM
- [x] Real-time collaboration with Yjs and Hocuspocus
- [x] React frontend with drag & drop components
- [x] Image upload and storage in database
- [x] Hierarchical organization (Notebooks → Sections → Pages)
- [x] Responsive UI with Tailwind CSS
- [x] TypeScript throughout the stack

### 📂 Sample Data Included
The seeded database includes:
- 2 sample notebooks ("Personal Notes", "Work Projects")
- 3 sections across the notebooks
- 3 sample pages with content
- 4 text components with example content

### 🚧 Known Limitations
- Drawing components are UI placeholders (not yet implemented)
- Real-time collaboration requires both clients to be connected
- SQLite is single-user (for production, switch to PostgreSQL)

## 🔧 Production Deployment

### Backend
```bash
cd server
npm run build
npm start
```

### Frontend
```bash
cd client
npm run build
# Serve dist/ folder with your web server
```

### Database
For production, switch back to PostgreSQL:
1. Update `server/prisma/schema.prisma` datasource to `postgresql`
2. Update DATABASE_URL to PostgreSQL connection string
3. Run migrations: `npx prisma migrate deploy`

## 🐛 Troubleshooting

### Common Issues

**Backend Won't Start**
```bash
# Check if ports are available
lsof -i :3000
lsof -i :3001

# Check database
ls -la server/dev.db
```

**Frontend Build Issues**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Database Issues**
```bash
# Reset database
rm server/dev.db
cd server
npx prisma migrate dev --name init
npm run db:seed
```

## 🎯 Future Enhancements

- [ ] Drawing/sketch components with SVG
- [ ] Rich text formatting (bold, italic, lists)
- [ ] Page templates and themes
- [ ] User authentication and permissions
- [ ] Export to PDF/Word
- [ ] Mobile app with React Native
- [ ] Advanced search and tagging
- [ ] Version history and undo/redo
- [ ] Comments and annotations
- [ ] Offline support with sync

---

Built with ❤️ using React, Node.js, SQLite, and Yjs

## 🔍 Architecture Decisions

### Why SQLite for Development?
- Zero configuration setup
- No external dependencies
- Perfect for demonstration and development
- Easy to reset and seed with sample data

### Why Yjs for Real-time Collaboration?
- Conflict-free replicated data types (CRDT)
- Handles network partitions gracefully
- Works offline with automatic sync when reconnected
- Battle-tested in production applications

### Component Architecture
- Absolute positioning for OneNote-like experience
- React Draggable/Resizable for smooth interactions
- Yjs integration for real-time position sync
- Optimistic updates with conflict resolution