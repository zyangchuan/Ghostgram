import { create } from 'zustand';

type Post = { userName: string, relationship: string, imageUrl: string, description: string }

type State = {
  posts: Array<Post>;
  searchResult: Array<Post>
}

type Action = {
  addPost: (post: { userName: string, relationship: string, imageUrl: string; description: string }) => void;
}

export const usePostStore = create<State & Action>((set) => ({
  posts: [
    { userName: "Jerryl", relationship: "Friend", imageUrl: "https://ghostgram-images.s3.ap-southeast-1.amazonaws.com/images/samples/image1.jpg", description: "Hello guys we are in Germany. HAHA 😆 #berlin #bratwurst" },
    { userName: "Han Sheng", relationship: "Stranger", imageUrl: "https://ghostgram-images.s3.ap-southeast-1.amazonaws.com/images/samples/image3.jpg", description: "Awesome food 🌮" },
    { userName: "Yangchuan", relationship: "Friend", imageUrl: "https://ghostgram-images.s3.ap-southeast-1.amazonaws.com/images/samples/image2.jpg", description: "It's super crowded at Orchard today. Im never going our on Saturday again.😤" }
  ],
  searchResult: [],
  addPost: (post: Post) => set((state) => ({ posts: [...state.posts, post] })),
  setSearchResult: (searchResult: Array<Post>) => set(() => ({ searchResult: searchResult }))
}))
