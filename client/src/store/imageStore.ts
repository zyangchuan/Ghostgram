import { create } from 'zustand';

type State = {
  savedImage: string;
  savedImageUrl: string;
  redactedImageUrl: string;
};

type Action = {
  setSavedImage: (savedImage: State['savedImage']) => void;
  setSavedImageUrl: (savedImageUrl: State['savedImageUrl']) => void;
  setRedactedImageUrl: (redactedImageUrl: State['redactedImageUrl']) => void;
};

export const useImageStore = create<State & Action>((set) => ({
  savedImage: "",
  setSavedImage: (savedImage) => set(() => ({ savedImage: savedImage })),
  savedImageUrl: "https://ghostgram-images.s3.ap-southeast-1.amazonaws.com/images/samples/b3007355-d7ce-4970-9c45-b5f0fce5dda0.jpg",
  setSavedImageUrl: (savedImageUrl) => set(() => ({ savedImageUrl: savedImageUrl })),
  redactedImageUrl: "",
  setRedactedImageUrl: (redactedImageUrl) => set(() => ({ redactedImageUrl: redactedImageUrl })),
}));
