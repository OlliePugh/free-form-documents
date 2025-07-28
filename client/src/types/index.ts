export interface Notebook {
  id: string;
  title: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  sections: Section[];
  sectionGroups: SectionGroup[];
}

export interface SectionGroup {
  id: string;
  title: string;
  notebookId: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  children: SectionGroup[];
  sections: Section[];
}

export interface Section {
  id: string;
  title: string;
  notebookId: string;
  sectionGroupId?: string;
  createdAt: string;
  updatedAt: string;
  pages: Page[];
}

export interface Page {
  id: string;
  title: string;
  sectionId: string;
  createdAt: string;
  updatedAt: string;
  components: PageComponent[];
}

export interface PageComponent {
  id: string;
  pageId: string;
  type: 'TEXT' | 'IMAGE' | 'DRAWING';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  text?: string;
  imageData?: Buffer;
  shapeData?: any;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotebookRequest {
  title: string;
  color?: string;
}

export interface CreateSectionRequest {
  title: string;
  notebookId: string;
  sectionGroupId?: string;
}

export interface CreatePageRequest {
  title: string;
  sectionId: string;
}

export interface CreatePageComponentRequest {
  pageId: string;
  type: 'TEXT' | 'IMAGE' | 'DRAWING';
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
  text?: string;
  shapeData?: any;
}

export interface UpdatePageComponentRequest {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  zIndex?: number;
  text?: string;
  shapeData?: any;
}