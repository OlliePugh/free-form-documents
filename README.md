# OneNote-like Collaborative Application

A full-stack collaborative note-taking application built with React, Node.js, TypeScript, and Yjs for real-time synchronization.

## 🚀 Features

- **Real-time Collaboration**: Multiple users can edit simultaneously using Yjs and Hocuspocus v3.2.2
- **Hierarchical Structure**: Notebooks → Sections → Pages → Components
- **Movable Components**: Drag, resize, and position text, image, and drawing components with absolute positioning
- **Image Upload**: Upload and display images with binary storage in SQLite
- **Type-safe**: Full TypeScript implementation with strict typing
- **Modern Stack**: React 18, Node.js with Express, Prisma ORM, and SQLite

## 🛠 Tech Stack

### Backend
- **Language**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: SQLite with Prisma ORM
- **Real-time**: Hocuspocus v3.2.2 WebSocket server
- **File Upload**: Multer for image processing

### Frontend  
- **Framework**: React 18 with TypeScript
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Real-time**: Hocuspocus Provider v3.2.2 with Yjs
- **UI Components**: React Draggable, React Resizable

## 📁 Project Structure

```
project/
├── server/                 # Backend API and Hocuspocus server
│   ├── src/
│   │   ├── routes/        # Express API routes
│   │   ├── realtime/      # Hocuspocus WebSocket server
│   │   ├── db.ts          # Database connection
│   │   ├── index.ts       # Main server entry point
│   │   └── seed.ts        # Database seeding
│   ├── prisma/            # Database schema and migrations
│   └── package.json
└── client/                # React frontend
    ├── src/
    │   ├── components/    # React components
    │   ├── hooks/         # Custom hooks (useCollaboration)
    │   ├── api/          # API client functions
    │   ├── types/        # TypeScript type definitions
    │   └── App.tsx       # Main React component
    └── package.json
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git

### 1. Clone and Setup
```bash
git clone <repository-url>
cd project
```

### 2. Backend Setup
```bash
cd server
npm install
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run database migrations  
npm run db:seed         # Populate with sample data
npm run dev             # Start development server
```

The backend will start on:
- **HTTP API**: http://localhost:3000
- **WebSocket**: ws://localhost:3001

### 3. Frontend Setup (New Terminal)
```bash
cd client
npm install
npm run dev             # Start React development server
```

The frontend will be available at: http://localhost:5173

## 🎯 Usage

1. **Browse Notebooks**: View all notebooks on the homepage
2. **Navigate Structure**: Click through Notebooks → Sections → Pages
3. **Edit Pages**: 
   - Add text components with the "Add Text" button
   - Upload images with the "Add Image" button  
   - Drag and resize components freely
   - See real-time changes from other users
4. **Collaborate**: Open the same page in multiple browser tabs to see real-time collaboration

## 🔧 API Endpoints

### Core Entities
- `GET /api/notebooks` - List all notebooks
- `GET /api/notebooks/:id` - Get notebook with sections and pages
- `GET /api/sections/:id` - Get section with pages
- `GET /api/pages/:id` - Get page with components
- `GET /api/components/page/:pageId` - Get all components for a page

### Component Operations
- `POST /api/components` - Create new component
- `PUT /api/components/:id` - Update component
- `DELETE /api/components/:id` - Delete component
- `POST /api/components/upload-image` - Upload image component
- `GET /api/components/image/:id` - Serve image binary data

### System
- `GET /health` - Health check endpoint

## 🔄 Real-time Collaboration

### How it Works
- **Yjs Documents**: Each page is a Yjs document with CRDT (Conflict-free Replicated Data Type)
- **Hocuspocus Server**: WebSocket backend that synchronizes Yjs documents across clients
- **Component Sync**: Position, content, and lifecycle changes sync automatically
- **Database Persistence**: Changes are debounced and stored in SQLite via Prisma

### Collaboration Features
- **Live Cursors**: See where other users are editing
- **Real-time Updates**: Instant synchronization of text, position, and component changes
- **Conflict Resolution**: Yjs automatically merges conflicting changes
- **Offline Support**: Changes sync when reconnected

## 🗄 Database Schema

### Core Models
- **Notebook**: `{ id, title, color, sections[] }`
- **Section**: `{ id, title, notebookId, pages[] }`  
- **Page**: `{ id, title, sectionId, components[] }`
- **PageComponent**: `{ id, pageId, type, x, y, width, height, zIndex, text?, imageData?, shapeData? }`

### Component Types
- **TEXT**: Editable text with Y.Text synchronization
- **IMAGE**: Uploaded images stored as binary data
- **DRAWING**: Vector shapes (basic implementation)

## 🔄 Recent Updates (v3.2.2)

### Hocuspocus v3.2.2 Upgrade
- ✅ **Updated Dependencies**: Upgraded from Hocuspocus v2.8.0 to v3.2.2
- ✅ **API Migration**: Changed from `Server.configure()` to `new Server()` constructor
- ✅ **Enhanced Performance**: Latest Hocuspocus improvements and bug fixes
- ✅ **Better Type Safety**: Improved TypeScript definitions

### Previous Major Fixes Applied
- ✅ **Fixed Component Loading**: Components now load properly when opening pages (resolved "no components loaded" error)
- ✅ **Fixed zIndex Management**: Replaced timestamp-based zIndex with sequential integers (0, 1, 2...)
- ✅ **Added zIndex Utilities**: `bringToFront()` and `sendToBack()` functions for layering control
- ✅ **Improved Database Sync**: Better handling of component deletions and JSON parsing
- ✅ **Enhanced Error Handling**: Robust error handling for shape data parsing and document sync
- ✅ **Fixed Git Ignore**: Properly excluded `node_modules` from version control

## 🐛 Troubleshooting

### Hocuspocus Connection Issues
```bash
# Check if Hocuspocus server is running
curl http://localhost:3000/health

# Check WebSocket connection
# In browser DevTools: new WebSocket('ws://localhost:3001')
```

### Components Not Loading
```bash
# Verify components exist in database
curl -s "http://localhost:3000/api/components/page/{PAGE_ID}"

# Check Hocuspocus logs for sync events
# Look for "📄 Loading document" and "📦 Loaded X components" messages
```

### Development Issues
```bash
# Reset database
cd server
rm prisma/dev.db
npm run db:migrate
npm run db:seed

# Clear browser cache and restart servers
```

## 📚 Key Technologies

### Why Hocuspocus?
- **Built for Collaboration**: Designed specifically for real-time collaborative applications
- **Yjs Integration**: Native support for Yjs CRDT technology
- **WebSocket Optimized**: Efficient binary protocol for minimal bandwidth usage
- **Extensible**: Plugin architecture for custom functionality
- **Battle-tested**: Used in production by Tiptap and other collaborative editors

### Component Architecture  
- **Absolute Positioning**: Components use x, y coordinates for flexible layouts
- **Sequential zIndex**: Clean layering system (0, 1, 2...) instead of timestamps
- **Yjs Integration**: Each component is a Y.Map with reactive properties
- **Real-time Sync**: Position, size, and content changes sync across all clients
- **Database Persistence**: Debounced writes ensure data durability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Yjs** - Conflict-free Replicated Data Types
- **Hocuspocus** - Collaborative editing backend
- **Tiptap Team** - Real-time collaboration infrastructure
- **Prisma** - Next-generation ORM for TypeScript