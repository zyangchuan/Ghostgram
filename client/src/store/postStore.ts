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
    { userName: "Jerryl", relationship: "Following", imageUrl: "https://ghostgram-images.s3.ap-southeast-1.amazonaws.com/images/samples/b3007355-d7ce-4970-9c45-b5f0fce5dda0.jpg", description: "Hello guys we are at Haji Lane. HAHA 😆" },
    { userName: "Han Sheng", relationship: "Stranger", imageUrl: "https://ghostgram-images.s3.ap-southeast-1.amazonaws.com/images/samples/photo1.jpg", description: "Cycling at MBS hoho 🚴" },
    { userName: "Yangchuan", relationship: "Stranger", imageUrl: "https://ghostgram-images.s3.ap-southeast-1.amazonaws.com/images/samples/image2.jpg", description: "It's super crowded at Orchard today. Im never going our on Saturday again.😤" }
  ],
  searchResult: [],
  addPost: (post: Post) => set((state) => ({ posts: [...state.posts, post] })),
  setSearchResult: (searchResult: Array<Post>) => set(() => ({ searchResult: searchResult }))
}))
