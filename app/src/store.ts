import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  searchQuery: string;
  setSearchQuery: (searchQuery: string) => void;
  selectedTags: string[];
  addSelectedTag: (tag: string) => void;
  removeSelectedTag: (tag: string) => void;
  view: "grid" | "rows";
  setView: (view: "grid" | "rows") => void;
}

export const useStore = create<TemplateStore>()(
  persist(
    (set) => ({
      templates: [],
      setTemplates: (templates) => set({ templates }),
      searchQuery: "",
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      selectedTags: [],
      addSelectedTag: (tag) =>
        set((state) => ({
          selectedTags: state.selectedTags.includes(tag)
            ? state.selectedTags
            : [...state.selectedTags, tag],
        })),
      removeSelectedTag: (tag) =>
        set((state) => ({
          selectedTags: state.selectedTags.filter((t) => t !== tag),
        })),
      view: "grid",
      setView: (view) => set({ view }),
    }),
    {
      name: "template-store",
      partialize: (state) => ({ view: state.view }), // Only persist the view preference
    }
  )
);
