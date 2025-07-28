-- CreateTable
CREATE TABLE "notebooks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "color" TEXT DEFAULT '#4F46E5',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "section_groups" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "notebookId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "section_groups_notebookId_fkey" FOREIGN KEY ("notebookId") REFERENCES "notebooks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "section_groups_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "section_groups" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "sections" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "notebookId" TEXT NOT NULL,
    "sectionGroupId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sections_notebookId_fkey" FOREIGN KEY ("notebookId") REFERENCES "notebooks" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "sections_sectionGroupId_fkey" FOREIGN KEY ("sectionGroupId") REFERENCES "section_groups" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pages_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "page_components" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "x" REAL NOT NULL,
    "y" REAL NOT NULL,
    "width" REAL NOT NULL,
    "height" REAL NOT NULL,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    "text" TEXT,
    "imageData" BLOB,
    "shapeData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "page_components_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
