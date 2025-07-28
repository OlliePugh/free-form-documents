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

### 1. Clone Repository & Setup Git
```bash
git clone <repository-url>
cd onenote-clone

# Initialize git if cloning manually
git init
git add .
git commit -m "Initial commit"
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
│   ├── .gitignore      # Server-specific git ignore
│   └── package.json
├── client/              # Frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── hooks/       # Custom hooks (Yjs)
│   │   ├── api/         # API client
│   │   └── types/       # TypeScript types
│   ├── .gitignore      # Client-specific git ignore
│   └── package.json
├── .gitignore          # Root git ignore
└── README.md
```

### Git Ignore Setup
The project includes comprehensive `.gitignore` files:
- **Root**: General exclusions (node_modules, OS files, IDE files)
- **Server**: Backend-specific (build output, database files, .env)
- **Client**: Frontend-specific (build output, Vite cache)

**Important**: `node_modules/` directories are properly excluded from version control.

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
- [x] **FIXED**: Real-time collaboration with Yjs and Hocuspocus
- [x] React frontend with drag & drop components
- [x] Image upload and storage in database
- [x] Hierarchical organization (Notebooks → Sections → Pages)
- [x] Responsive UI with Tailwind CSS
- [x] TypeScript throughout the stack
- [x] Proper Git ignore configuration
- [x] **FIXED**: Component loading when opening pages
- [x] **FIXED**: Proper zIndex management (0, 1, 2... instead of timestamps)

### 📂 Sample Data Included
The seeded database includes:
- 2 sample notebooks ("Personal Notes", "Work Projects")
- 3 sections across the notebooks
- 3 sample pages with content
- 4 text components with example content

### 🔧 Recent Fixes Applied
1. **Hocuspocus Server Setup**: Fixed the server configuration to use `Server.configure()` instead of `new Server()`
2. **Component Loading**: Improved the `onLoadDocument` hook to properly load existing components when a page is opened
3. **zIndex Management**: Replaced timestamp-based zIndex with proper sequential integers (0, 1, 2...)
4. **Database Synchronization**: Enhanced bidirectional sync between Yjs and SQLite database
5. **Error Handling**: Added comprehensive logging and error handling for debugging
6. **Package Scripts**: Fixed npm scripts to use correct commands (`tsx` instead of `bun`)

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

**Hocuspocus Connection Issues**
```bash
# Check WebSocket connection
curl -I http://localhost:3001

# Check server logs for Hocuspocus startup messages
# Should see: "Hocuspocus v2.x.x running at ws://0.0.0.0:3001"
```

**Components Not Loading**
- Ensure the Hocuspocus server is running on port 3001
- Check browser console for WebSocket connection errors
- Verify page ID exists in database: `GET /api/components/page/{pageId}`
- Check server logs for "Loading document" and "Found X components" messages

**Git Issues**
```bash
# Check git status
git status

# If you see node_modules in git status, ensure .gitignore is working:
git rm -r --cached node_modules
git commit -m "Remove node_modules from tracking"
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

### Why Hocuspocus?
- Built specifically for Yjs WebSocket connections
- Provides hooks for database persistence
- Handles connection management and scaling
- Comprehensive logging and debugging features

### Component Architecture
- Absolute positioning for OneNote-like experience
- React Draggable/Resizable for smooth interactions
- Yjs integration for real-time position sync
- Optimistic updates with conflict resolution
- Sequential zIndex management for proper layering

### Git Best Practices
- Comprehensive `.gitignore` setup prevents committing dependencies
- Separate ignore files for different project areas
- Environment files excluded to protect sensitive data
- Build artifacts and cache files properly excluded