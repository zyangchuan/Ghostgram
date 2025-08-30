import { create } from 'zustand';

type Region = { type: string, tag: string, reason: string, area: string }

type State = {
  regions: Array<Region>;
  options: Array<Region>;
}

type Action = {
  addRegion: (region: Region) => void;
  removeRegion: (region: Region) => void;
  setRegions: (regions: Array<Region>) => void;
  setOptions: (options: Array<Region>) => void;
}

export const useRegionStore = create<State & Action>((set) => ({
  regions: [],
  options: [],
  addRegion: (region: Region) => set((state) => ({ regions: [...state.regions, region] })),
  removeRegion: (region: Region) => set((state) => ({ regions: state.regions.filter(r => r.tag !== region.tag) })),
  setRegions: (regions: Array<Region>) => set(() => ({ regions: regions })),
  setOptions: (options: Array<Region>) => set(() => ({ options: options }))
}))
