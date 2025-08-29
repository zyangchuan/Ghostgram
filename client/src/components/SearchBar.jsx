import { useState } from "@lynx-js/react";
import searchLogo from "../assets/user-round-search.png";
import { useEffect } from "react";
import { usePostStore } from "../store/postStore";

export default function SearchBar() {
  const [inputContent, setInputContent] = useState("")
  const {posts, searchResult, setSearchResult} = usePostStore()
  useEffect(() => {
    setSearchResult(posts.filter(post => post.userName.includes(inputContent)))
  }, [inputContent])
  return (
    <view className="flex w-full h-12 p-2 bg-gray-200 rounded-xl">
      <image src={searchLogo} mode="aspectFill" auto-size className="opacity-30" />
      <input bindinput={(res) => {
          setInputContent(res.detail.value);
        }} placeholder="Search users" className="w-full h-full font-semibold text-xl ml-3" />
    </view>
  )
}