import { Server } from "@hocuspocus/server";
import * as Y from "yjs";
import { prisma } from "../db";

export class HocuspocusServer {
  private server: Server;

  constructor(port: number) {
    this.server = new Server({
      port,
      name: "OneNote Collaboration Server",

      async onConnect(data) {
        console.log(`🔗 Client connected to document: ${data.documentName}`);
      },

      async onDisconnect(data) {
        console.log(
          `🔌 Client disconnected from document: ${data.documentName}`
        );
      },

      async onLoadDocument(data) {
        console.log(`📄 Loading document: ${data.documentName}`);

        // Load existing page components if this is a page document
        if (data.documentName.startsWith("page:")) {
          const pageId = data.documentName.replace("page:", "");

          try {
            const components = await prisma.pageComponent.findMany({
              where: { pageId },
              orderBy: { zIndex: "asc" },
            });

            console.log(
              `Found ${components.length} components for page ${pageId}`
            );

            // Initialize Yjs document with existing components
            const yDoc = data.document;
            const yComponents = yDoc.getMap("components");

            components.forEach((component) => {
              const yComponent = new Y.Map();
              yComponent.set("id", component.id);
              yComponent.set("type", component.type);
              yComponent.set("x", component.x);
              yComponent.set("y", component.y);
              yComponent.set("width", component.width);
              yComponent.set("height", component.height);
              yComponent.set("zIndex", component.zIndex);

              if (component.text) {
                const yText = new Y.Text(component.text);
                yComponent.set("text", yText);
              }

              if (component.shapeData) {
                try {
                  const parsedShapeData = JSON.parse(
                    component.shapeData as string
                  );
                  yComponent.set("shapeData", parsedShapeData);
                } catch (error) {
                  console.error("Error parsing shape data:", error);
                }
              }

              if (component.imageData) {
                yComponent.set("hasImage", true);
              }

              yComponents.set(component.id, yComponent);
            });

            console.log(
              `Loaded ${yComponents.size} components into Yjs document`
            );
            return yDoc;
          } catch (error) {
            console.error("Error loading document:", error);
            return data.document;
          }
        }

        return data.document;
      },

      async onStoreDocument(data) {
        console.log(`💾 Storing document: ${data.documentName}`);

        if (data.documentName.startsWith("page:")) {
          const pageId = data.documentName.replace("page:", "");

          try {
            // Apply the document state and sync with database
            const yComponents = data.document.getMap("components");

            // Get all component IDs from Yjs
            const yjsComponentIds = new Set<string>();
            yComponents.forEach((_, componentId) => {
              yjsComponentIds.add(componentId);
            });

            // Get all component IDs from database
            const dbComponents = await prisma.pageComponent.findMany({
              where: { pageId },
              select: { id: true },
            });
            const dbComponentIds = new Set(dbComponents.map((c) => c.id));

            // Delete components that exist in DB but not in Yjs (they were deleted)
            const toDelete = Array.from(dbComponentIds).filter(
              (id) => !yjsComponentIds.has(id)
            );
            if (toDelete.length > 0) {
              await prisma.pageComponent.deleteMany({
                where: {
                  id: { in: toDelete },
                  pageId,
                },
              });
              console.log(`Deleted ${toDelete.length} components`);
            }

            // Upsert components from Yjs to database
            for (const [componentId, yComponent] of yComponents.entries()) {
              if (yComponent instanceof Y.Map) {
                const componentData = {
                  x: yComponent.get("x") as number,
                  y: yComponent.get("y") as number,
                  width: yComponent.get("width") as number,
                  height: yComponent.get("height") as number,
                  zIndex: yComponent.get("zIndex") as number,
                  text:
                    yComponent.get("text") instanceof Y.Text
                      ? (yComponent.get("text") as Y.Text).toString()
                      : undefined,
                  shapeData: yComponent.get("shapeData")
                    ? JSON.stringify(yComponent.get("shapeData"))
                    : undefined,
                };

                await prisma.pageComponent.upsert({
                  where: { id: componentId },
                  update: componentData,
                  create: {
                    id: componentId,
                    pageId,
                    type: yComponent.get("type") as string,
                    ...componentData,
                  },
                });
              }
            }
          } catch (error) {
            console.error("Error storing document:", error);
          }
        }
      },

      async onChange(data) {
        // Real-time change handling
        console.log(`🔄 Document changed: ${data.documentName}`);
        console.log(`📊 Change details:`, {
          documentName: data.documentName,
          context: data.context,
          update: data.update ? "Update received" : "No update",
          documentSize: data.document ? "Document exists" : "No document",
        });

        if (data.documentName.startsWith("page:")) {
          const yComponents = data.document.getMap("components");
          console.log(`📦 Components in document: ${yComponents.size}`);

          // Log any component changes
          yComponents.forEach((yComponent, componentId) => {
            if (yComponent instanceof Y.Map) {
              console.log(
                `📍 Component ${componentId}: x=${yComponent.get(
                  "x"
                )}, y=${yComponent.get("y")}`
              );
            }
          });
        }
      },
    });
  }

  start() {
    this.server.listen();
    console.log(
      `🚀 Hocuspocus server started on port ${this.server.configuration.port}`
    );
  }

  stop() {
    this.server.destroy();
    console.log("🛑 Hocuspocus server stopped");
  }
}

export default HocuspocusServer;
