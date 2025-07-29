export interface CreateNotebookRequest {
  title: string;
  color?: string;
}

export interface CreateSectionGroupRequest {
  title: string;
  notebookId: string;
  parentId?: string;
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

export interface YjsUpdate {
  pageId: string;
  update: Uint8Array;
}