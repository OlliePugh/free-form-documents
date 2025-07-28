import { Server } from '@hocuspocus/server';
import * as Y from 'yjs';
import { prisma } from '../db';

export class HocuspocusServer {
  private server: Server;

  constructor(port: number) {
    this.server = new Server({
      port,
      name: 'OneNote Collaboration Server',
      
      async onConnect(data) {
        console.log(`🔗 Client connected to document: ${data.documentName}`);
      },

      async onDisconnect(data) {
        console.log(`🔌 Client disconnected from document: ${data.documentName}`);
      },

      async onLoadDocument(data) {
        console.log(`📄 Loading document: ${data.documentName}`);
        
        // Load existing page components if this is a page document
        if (data.documentName.startsWith('page:')) {
          const pageId = data.documentName.replace('page:', '');
          
          try {
            const components = await prisma.pageComponent.findMany({
              where: { pageId },
              orderBy: { zIndex: 'asc' }
            });

            // Initialize Yjs document with existing components
            const yDoc = new Y.Doc();
            const yComponents = yDoc.getMap('components');
            
            components.forEach(component => {
              const yComponent = new Y.Map();
              yComponent.set('id', component.id);
              yComponent.set('type', component.type);
              yComponent.set('x', component.x);
              yComponent.set('y', component.y);
              yComponent.set('width', component.width);
              yComponent.set('height', component.height);
              yComponent.set('zIndex', component.zIndex);
              
              if (component.text) {
                const yText = new Y.Text(component.text);
                yComponent.set('text', yText);
              }
              
              if (component.shapeData) {
                yComponent.set('shapeData', component.shapeData);
              }
              
              if (component.imageData) {
                yComponent.set('hasImage', true);
              }
              
              yComponents.set(component.id, yComponent);
            });

            return Y.encodeStateAsUpdate(yDoc);
          } catch (error) {
            console.error('Error loading document:', error);
            return new Uint8Array();
          }
        }

        return new Uint8Array();
      },

      async onStoreDocument(data) {
        console.log(`💾 Storing document: ${data.documentName}`);
        
        if (data.documentName.startsWith('page:')) {
          const pageId = data.documentName.replace('page:', '');
          
          try {
            // Apply the document state and sync with database
            const yDoc = new Y.Doc();
            Y.applyUpdate(yDoc, data.document);
            
            const yComponents = yDoc.getMap('components');
            
            // This is a simplified sync - in production you'd want more sophisticated conflict resolution
            for (const [componentId, yComponent] of yComponents.entries()) {
              if (yComponent instanceof Y.Map) {
                const componentData = {
                  x: yComponent.get('x') as number,
                  y: yComponent.get('y') as number,
                  width: yComponent.get('width') as number,
                  height: yComponent.get('height') as number,
                  zIndex: yComponent.get('zIndex') as number,
                  text: yComponent.get('text') instanceof Y.Text 
                    ? (yComponent.get('text') as Y.Text).toString() 
                    : undefined,
                  shapeData: yComponent.get('shapeData') || undefined
                };

                await prisma.pageComponent.upsert({
                  where: { id: componentId },
                  update: componentData,
                  create: {
                    id: componentId,
                    pageId,
                    type: yComponent.get('type') as any,
                    ...componentData
                  }
                });
              }
            }
          } catch (error) {
            console.error('Error storing document:', error);
          }
        }
      },

      async onChange(data) {
        // Real-time change handling
        console.log(`🔄 Document changed: ${data.documentName}`);
      }
    });
  }

  start() {
    this.server.listen();
    console.log(`🚀 Hocuspocus server started on port ${this.server.configuration.port}`);
  }

  stop() {
    this.server.destroy();
    console.log('🛑 Hocuspocus server stopped');
  }
}

export default HocuspocusServer;