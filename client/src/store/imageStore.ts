import { create } from 'zustand';

type State = {
  savedImage: string;
  savedImageUrl: string;
};

type Action = {
  setSavedImage: (savedImage: State['savedImage']) => void;
  setSavedImageUrl: (savedImageUrl: State['savedImageUrl']) => void;
};

export const useImageStore = create<State & Action>((set) => ({
  savedImage: "",
  setSavedImage: (savedImage) => set(() => ({ savedImage: savedImage })),
  savedImageUrl: "",
  setSavedImageUrl: (savedImageUrl) => set(() => ({ savedImageUrl: savedImageUrl })),
}));
