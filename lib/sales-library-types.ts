export type SalesCategory = { id: string; name: string; position: number };
export type SalesTemplate = {
  id: string; title: string; description: string; categoryId: string;
  subject: string; content: string; sections: { id: string; title: string; content: string }[];
  status: 'active' | 'archived'; position: number; updatedAt: string;
};
export type SalesSettings = { brand: string; website: string; email: string; phone: string; zone: string; objective: string; pricing: string };
export type SalesVersion = { id: string; templateId: string; snapshot: SalesTemplate; createdAt: string };
export type SalesVariable = { id: string; label: string; defaultValue: string };
export type SalesLibraryState = { templates: SalesTemplate[]; categories: SalesCategory[]; settings: SalesSettings; variables: SalesVariable[]; versions: SalesVersion[] };
