import { create } from 'zustand'

interface Template {
  id: string;
  name: string;
  description: string;
  version: string;
  logo?: string;
  links: {
    github?: string;
    website?: string;
    docs?: string;
  };
  tags: string[];
}

interface TemplateStore {
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
}

export const useStore = create<TemplateStore>((set) => ({
  templates: [],
  setTemplates: (templates) => set({ templates }),
})) 