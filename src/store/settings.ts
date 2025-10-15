import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ChatSettings {
  modelProvider: string;
  model: string;
  temperature: number;
  top_p: number;
  max_tokens: number;
  debug: boolean;
}

interface ChatSettingsState {
  settings: ChatSettings;
  update: (partial: Partial<ChatSettings>) => void;
  reset: () => void;
}

const DEFAULTS: ChatSettings = {
  modelProvider: "groq",
  model: "qwen/qwen3-32b",
  temperature: 0.7,
  top_p: 1.0,
  max_tokens: 1024,
  debug: false,
};

export const useChatSettingsStore = create<ChatSettingsState>()(
  persist(
    (set, get) => ({
      settings: DEFAULTS,
      update: (partial) => set({ settings: { ...get().settings, ...partial } }),
      reset: () => set({ settings: DEFAULTS }),
    }),
    {
      name: "chat-settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ settings: s.settings }),
    }
  )
);
