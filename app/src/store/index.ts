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

interface Store {
  templates: Template[];
  setTemplates: (templates: Template[]) => void;
  githubStars: number;
  setGithubStars: (count: number) => void;
}

export const useStore = create<Store>((set) => ({
  templates: [],
  setTemplates: (templates) => set({ templates }),
  githubStars: 0,
  setGithubStars: (count) => set({ githubStars: count }),
})) 