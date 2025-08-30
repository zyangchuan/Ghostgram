import { create } from 'zustand';

type Region = { type: string, tag: string, reason: string, area: string }

type State = {
  regions: Array<Region>;
}

type Action = {
  addRegion: (region: Region) => void;
  removeRegion: (region: Region) => void;
}

export const useRegionStore = create<State & Action>((set) => ({
  regions: [],
  addRegion: (region: Region) => set((state) => ({ regions: [...state.regions, region] })),
  removeRegion: (region: Region) => set((state) => ({ regions: state.regions.filter(r => r.tag !== region.tag) }))
}))
